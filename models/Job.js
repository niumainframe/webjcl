function Job (params) {
    
    params = params || {};
    
    this.id = params.id || null;
    this.user = params.user || null;
    this.body = params.body || null;
    this.output = params.output || null;
    this.date = params.date || new Date();
}

module.exports = Job;
