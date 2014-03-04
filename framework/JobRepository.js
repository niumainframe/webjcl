function JobRepository () {
    
    
}

JobRepository.prototype.saveJob = function (job) {
    console.log('JobRepository.saveJob()', job);
}

module.exports = JobRepository;
