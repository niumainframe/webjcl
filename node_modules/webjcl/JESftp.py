#!/usr/bin/env python

from ftplib import FTP, Error, error_perm
import re, os, sys, time, ConfigParser, getpass

class JESftpError(Exception): pass

class JESftp:
   
   ftp      = FTP()
   
   server   = None
   username = None
   password = None
   
   # State info
   configLoaded = False
   connected    = False
   
   # Constants
   _outfile_ext    = "txt"
   _outfile_pfx    = "-output"
   
   _conf_filename  = ".JESftp.cfg"
   _conf_paths     = (os.path.expanduser('~'), sys.path[0])
   _conf_sect      = "JESftp"
   _default_server = "zos.kctr.marist.edu"
   _newline        = '\n'
   
   
   
   def __init__(self, server=None, username=None, password=None, configfile=None):
         
      self.server   = server
      self.username = username
      self.password = password
      
      # Change newline character if we're on Windows
      if os.name == 'nt':
          self._newline = '\r\n'
      
      if configfile != None:
         self.loadConfig(configfile)
      
      if server != None and username != None and password != None:
         self.configLoaded = True
         self.connect()
   
   def __enter__(self):
      return self
      
      
   def __exit__(self, type, value, traceback):
      self.closeConnections()
      

   def connect(self, server=None, username=None, password=None):
      
      if self.configLoaded == False:
         
         if None in [server, username, password]:
            raise JESftpError("connect: server credentials incomplete")
         
         self.server   = server
         self.username = username
         self.password = password
      
      
      self.ftp.connect(self.server)
      self.ftp.login(self.username, self.password)
      
      # Tell that we're trying to upload directly to the job entry subsystem
      self.ftp.sendcmd("SITE FILETYPE=jes")
      
      self.connected = True
   
   
   def disconnect(self):
      '''Disconnects from the server.'''
      self.ftp.close()
      self.connected = False
   
   
   
   def submitJob(self, file):
      '''Sends a JCL file to the JES on the connected server.'''
      
      if self.connected == False :
         raise JESftpError("submitJob: not connected")
      
      
      jclPath     = os.path.abspath(file)
      jclBaseName = os.path.basename(jclPath)
      
      # Attempt to upload the file
      with open(file, 'r') as jclFile:
         storResult = self.ftp.storlines("STOR "+jclBaseName, jclFile)
      
      
      
      # Extract the JOB id from the response code
      jobpos = re.search("JOB[0-9]+", storResult)
      
      if jobpos == None:
         raise JESftpError("submitJob: file not accepted by JES" + self._newline + storResult)

      JOBID = storResult[jobpos.start():jobpos.end()]

      
      return JOBID
   
   
   
   def retrieveJob(self, JOBID, outfile):
      '''Downloads all of a job's output from the mainframe.
         
         JOBID
            The name of the job.  Example: JOB01002
         
         outfile
            The file to save to.
      
         TODO: separate job output
      '''
      if self.connected == False :
         raise JESftpError("retrieveJob: not connected")
         
      with open(outfile, 'wb') as outputFile:   
         # This lambda is a hack to make sure a newline character is written at the end of each line.
         # I imagine this may be a problem if using an editor that doesn't use \n
         self.ftp.retrlines("RETR "+JOBID+".x", lambda line: outputFile.write(line + self._newline))
         
      
      
   def deleteJob(self, JOBID):
      '''Deletes the specified job off the JES.
      
         JOBID
            The name of the job.  Example: JOB01002
      '''
      if self.connected == False :
         raise JESftpError("deleteJob: not connected")
      
      self.ftp.delete(JOBID);
      

   def processJobOutput(self, infile, splitPages=False):
       '''Reads output from a job and processes the control characters.
          I am uncertain on how accurate this is.
          
          infile
            The path of the file to process.
          
          [splitPages]
            Flag which indicates that a new file should be made for every page.
          '''
   
       infile_path  = os.path.abspath(infile)
       infile_baseName = os.path.basename(infile)
       
       pages    = []   # Each item in this list is a page.
       page_no  = 0;

       with open(infile, 'r') as jcl:
           
           line = jcl.readline()
           
           # Loop through the document reading all the lines.
           while line != "":
                
               # New Page
               if line[0] == '1':
                    pages.append("")
                    page_no += 1
                    
                
                # Double Spacing
               if line[0] == '0':
                   pages[page_no-1] += self._newline
                
                # Triple Spacing
               if line[0] == '-':
                   pages[page_no-1] += self._newline + self._newline
               
               # Truncate the first character off of each line when writing to the page. 
               pages[page_no-1] += line[1:len(line)]
                   
               line = jcl.readline()
       
       
       # Determine method (all one file || split by pages), then write output.
       outfile_path_noprefix = os.path.dirname(infile_path) + '/' + infile_baseName.split('.')[0]
       
       if splitPages == True:
           cnt = 0
           for pg in pages:
               cnt += 1
               with open(outfile_path_noprefix + "-pg" + str(cnt) + ".txt", 'w') as out:
                   out.write(pg)
                   
       else:
           with open(outfile_path_noprefix + "-pp.txt", 'w') as out:
               for pg in pages:
                   out.write(pg)
               
           

   def processJob(self, infile, outfile=None):
      '''Sends a JCL file to the JES, waits for the job to complete, 
         retrieves job file, deletes job off the mainframe.
         
         Returns the name of the outfile.
      
      infile
         The JCL file to be sent.
         
      [outfile]
         The job file to be written to.
         Defaults to the infile with changed extension.
         
      '''
      if self.connected == False :
         raise JESftpError("processJob: not connected")
      
      
      # Determine the correct infile/outfile information
      infile   = os.path.abspath(infile)
      infileBN = os.path.basename(infile)
      
      
      if outfile == None:
         outfile = os.path.dirname(infile) + "/" + changeExt(infileBN, self._outfile_ext, self._outfile_pfx)
      else: 
         outfile = os.path.abspath(outfile)
         
      outfileBN = os.path.basename(outfile)
      
      
      
      
      # Submit file
      print "Sending " + infileBN + " to the job entry subsystem."
      JOBID = self.submitJob(infile)
      

      # Wait a moment for the mainframe to process the file
      print "Waiting for completion of " + JOBID + "..."
      time.sleep(1)
      
      
      # Take four attempts at retrieving the job.
      for i in range(0,4):
      
         try:
            self.retrieveJob(JOBID, outfile)
            print "Downloaded " + JOBID + " to " + outfileBN
            break
            
         except error_perm as e:
            # If the server doesn't know about the job, wait awhile to try again.
            print ""
            print e
            print ""
            self.ftp.retrlines("LIST " + JOBID)
            time.sleep(5)
      
      # Delete the job
      self.deleteJob(JOBID)
      print "Deleted " + JOBID
      
      
      return outfile
   
   def loadConfig(self, filename=None, createOnFail=False):
      '''Reads connection information from a config file.
         
         filename
            Specify where the file should be read.
      '''
      
      if filename == None:
         
         # Search for config file.
         for p in self._conf_paths:
            try_path = p + '/' + self._conf_filename
            
            if os.path.exists(try_path): 
               filename = try_path
               break
         
         if filename == None and createOnFail == False:
            raise JESftpError("loadConfig: could not find a config file.")
         elif filename == None and createOnFail == True:
            self.createConfig(try_path)
            filename = try_path
             
      
      
      # Attempt to read config file.
      config = ConfigParser.RawConfigParser()
      
      if len(config.read(filename)) != 1:
         raise JESftpError("Could not parse (or read) configuration file")

      # Retrieve needed configuration options.
      try:
         self.username = config.get(self._conf_sect, 'username')
         self.password = config.get(self._conf_sect, 'password')
         self.server   = config.get(self._conf_sect, 'server')
      except ConfigParser.NoSectionError as e:
         print "Error in config file... ",
         print e
         return
      
      # TODO: Validation
      
      self.configLoaded = True;
      
      
   
   
   def createConfig(self, path):
      '''Interactively generates a config file for this class.
         Currently only server credientials are implemented.
         
         path
            The path to where the file should be saved
            Example: /home/user/.JESftp.cfg
            
         TODO: optional arguments that will make this non-interactive.
      '''
      
      # Create new config object
      config = ConfigParser.RawConfigParser()
      
      # Obtain needed config values from stdin
      server = raw_input("Host [zos.kctr.marist.edu]: ")
      if server == "":
         server = 'zos.kctr.marist.edu'

      username = raw_input("User ID: ")
      password = getpass.getpass("Password (written plaintext): ")
      
      
      # Add to config object
      config.add_section(self._conf_sect)
      config.set(self._conf_sect, 'server', server)
      config.set(self._conf_sect, 'username', username)
      config.set(self._conf_sect, 'password', password)
      
      
      # Write config to file
      with open(path, 'wb') as configfile:
         config.write(configfile)
         print "Config file written to " + path
      
      if os.name != 'nt':
         os.chmod(path,0600)
         print "Config file permissions changed to 0600"
      
      self.username = username
      self.password = password
      self.server   = server
      
      
      
   def closeConnections(self):
      '''Closes connections that this object may be connected to.'''
      self.ftp.close()
      
      
#######################################################################

def changeExt(fname, ext, prefix=None):
   '''Changes the extension of a filename string to something else.
      
      fname
         The string of the filename (base name, like file.jcl)
      
      ext
         The extension (no dots)
      
      DEFINITIONS
      
      base(path)name -> { bananas.jcl.txt }
                          ^        ^   ^ replaced extension
                          ^        ^
                          ^        ^ extension(s)
                          ^ filename
   ''' 
   
   # Split the basename into parts delimited by .
   basename_parts = fname.split('.')
   
   parts = len(basename_parts)
   result = ''

   # Add prefix to filename if needed
   if prefix != None:
       basename_parts[0] += prefix
   
   # Chop off the extension if it exists.
   if parts >= 2:
       basename_parts.pop()
       
   # String together the basename parts.
   for i in range(0, len(basename_parts)):
      result += basename_parts[i] + '.'
   
   
   # Add desired extension
   result = result + ext
   
   
   return result
      

      
#######################################################################

if __name__ == '__main__':
    
    import argparse
    
    # Parse command line arguments

    parser = argparse.ArgumentParser()
    parser.add_argument("-o", metavar="outfile", help="the outfile", default=None)
    parser.add_argument("--postproc", action="store_true", 
                         help="Do additonal processing on the job output.",
                         default=False)
    parser.add_argument("JCLFile", help="The JCL file to send")
    args = parser.parse_args()


    # I/O files
    jclPath     = os.path.abspath(args.JCLFile)
    outfile     = args.o
    
    try:

       with JESftp() as jes:
          
          jes.loadConfig(createOnFail=True)
          jes.connect()
          outfile = jes.processJob(jclPath, outfile)
          
          if args.postproc == True:
              jes.processJobOutput(outfile)
       
    except JESftpError as e:
       print e

    except IOError as e:
       print e
       
       
# END
