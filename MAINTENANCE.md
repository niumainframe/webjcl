# WebJCL Maintainence

WebJCL was originally developed to save the last 5 job submissions for convienence sake.  In the end this was never adequately implemented with MongoDB and instead ALL submissions are saved.  After awhile it runs out of memory/disk on small vps.

## Instructions on how to backup/clear the database

### (Optional Backup) Open up a SSH tunnel to the host with mongodb
    
    # Make the remote mongo instance appear on the localhost
    ssh -N -L 27017:localhost:27017 ssh-hostname
    
    # Dump the entire mongodb to $PWD/dump
    mongodump

### Drop the database

    # Inside the mongo shell
        
    use WebJCL
    db.dropDatabase()
    
### Alternative if the above doesn't work
    
    # Run the following on the host which contains mongodb
    
    # Stop mongodb EX:
    sudo service mongodb stop
    
    # Delete database files
    rm -rf /var/lib/mongodb
    
    # Start mongodb EX:
    sudo service mongodb start