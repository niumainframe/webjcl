# WebJCL

![WebJCL Screenshot](http://niumainframe.github.io/webjcl/images/webjcl-screenshot.png) 

WebJCL is a web-based development environment for programming with IBM Mainframe. It allows students to code and execute IBM assembler completely through the web-browser.  This was developed during an independent study between students at Northern Illinois University.  The server-side source code is currently written in node.js.

Features

* HTML5 interface.
    * Ace code editor
    * Multiple tabs
    * Resizable input/output panes.

* RESTful job submission interface.
    * Submit jobs to the real mainframe via HTTP protocol.
    * Support for other job processing modules.

Prerequisites
------------------

Required environments and their minimum tested versions: 

Server:


* [Node.js](http://nodejs.org/) v0.8.19
* [mongoDB](http://www.mongodb.org/) v2.2.3
* Python 2.6

Client:

* A modern web browser
    * Chromium 23
    * Firefox 18

Install
---------
To obtain the source code, either download the archive file of your choice from this GitHub repository or run the following command in the directory you wish to install WebJCL.

    git clone https://github.com/niumainframe/webjcl.git

After obtaining the source code, you must obtain the Node.js library requirements.

    cd webjcl
    npm install

### Configuration

There is some mandatory configuration before WebJCL can execute.

* config.js
    * Listening port (default 8000)
    * Whether to enforce SSL (default: true)
    * mongoDB credentials.

* srcprocs/JESProc/config.js
    * The hostname of the mainframe WebJCL connects to.

### Invoking

Given that MongoDB is running, one can invoke WebJCL while in the source code directory:

    node main.js

However in public-facing instances, it is highly recommended to use a persistence script which automatically restarts the application if it crashes.  The node.js application '[forever](https://npmjs.org/package/forever)' is recommended for this purpose.


## Background
NIU CS teaches the concepts of assembly language through the [IBM Basic Assembly Language](https://en.wikipedia.org/wiki/IBM_Basic_assembly_language) and [ASSIST](https://en.wikipedia.org/wiki/ASSIST_(computing)). While this is effective in exposing students how to program software at a low level; it is problematic because the development environment is limited compared to today's standards.

### 3270 Terminal
Prior to WebJCL, students typically obtained a 3270 terminal emulator to connect to a shared IBM Mainframe.  From this terminal students coded and executed assignment programs.

![Picture of a 3270 terminal](http://niumainframe.github.io/webjcl/images/3270-terminal.png)

Programming in a 3270 terminal has the following problems:

* The terminal has fixed rows/columns and the smallest scrolling unit is typically one page. This causes long assignments and algorithms to span many terminal pages.
* Non-intuitive keyboard commands for editing, especially for undergraduate students unfamiliar with vi/emacs-like editors.
* Execution and retrieval of output text requires navigating through several menus from the editor.

### Other development options
* Using [FTP-based](http://www.ibm.com/developerworks/systems/library/es-batch-zos.html) solutions
    * mar_ftp.exe [readme](http://www.cs.niu.edu/compresource/marist_readme.txt)
    * [JESftp.py](https://github.com/scvnc/JESftp)
    * [MVS-Tool](https://github.com/john-charles/MVSTool)
    * [MVS::JESFTP](http://search.cpan.org/~mikeo/MVS-JESFTP-1.1/JESFTP.pm)

* Using Simulators/Emulators
    * [mainframe-env-simulator](http://code.google.com/p/mainframe-env-simulator/)
    * [z390](http://z390.org/)
    * [Hercules](http://www.hercules-390.eu/)


Future Development Possibilities
---------------------------------------------
Currently, this system uses a [Python script](https://github.com/scvnc/JESftp) to interface with the actual mainframe to send, submit, retrieve, and clear the submission.  It would be nice to design and write a pure node.js module that utilizes the entire Mainframe/FTP interface.

Adding additional job processing modules such as one that submits the job to a mainframe simulator or emulator instead of a real mainframe.  This could be extended further to other language/machine environments.

Converting the database features to work with MySQL instead of mongoDB.

File management features.

Real-time collaboration/execution on code via something like the [share.js](http://sharejs.org/) library.

IBM assembler specific indentation and highlighting features for the editor.

Q&A
------

Where to I go to use this?

> WebJCL does not have a permanent host. It runs great on the free EC2 node from Amazon, if you'd like to set one up.  Efforts will be made to have a host available each semester for student use.

Do I need to set up my mainframe account with a 3270 terminal?

> For students taking CSCI 360: as far as we are concerned you could never touch a 3270 terminal, use WebJCL, and successfully complete the class.  It is still suggested to complete the lab tutorial on configuring your account on the mainframe.  The same should go for CSCI 640 as well.

Is my source code saved anywhere?

> Yes.  When you submit code, both the code and the resulting output are saved in a database.  *Your code/output is only accessible with your login credentials.*

Does it work for students in CSCI 465 (or other mainframe courses)?

>Since this simply submits a JCL file to be processed, probably yes. However, since there are instances where you must reference files on the remote mainframe: you may have to manually FTP some of your files.  Let us know your experiences.

Does this really work?

> Yes.  WebJCL was exposed to students taking CSCI 360 during Spring 2013.  Between 16 active users, 6000 jobs were submitted via WebJCL and all assignments can be successfully completed.

How secure is this?

* WebJCL can run as an underprivileged user.
* WebJCL works with existing web-servers by configuring a [reverse proxy](https://httpd.apache.org/docs/2.2/mod/mod_proxy.html).
* WebJCL can enforce SSL connections for secure transmission of mainframe credentials.
    * However, the FTP interface to the mainframe probably has it's credentials sent in cleartext.
* WebJCL practices password hashing.
* Temporary folders are created with permissions of 700.

Can I add a feature to WebJCL?

> Contact us (see support section) and make a request on the GitHub issue tracker.  We want to assist other students to continue this project. Most likely you could even get independent study credit at NIU. Fork away!

Support
-----------

For support and collaboration inquiries, please contact Vincent: vinciple [at] gmail [dot] com.

Please utilize the issue tracker on GitHub for bugs, feature requests, and other applicable articles.