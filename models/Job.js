function Job (params) {
    
    params = params || {};
    
    this.id = params.id || null;
    this.user = params.user || null;
    this.body = params.body || null;
    this.output = params.output || null;
    this.date = params.date || Date();
    
    Object.seal(this)
}

module.exports = Job;
