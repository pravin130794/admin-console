class ApiBaseUrl {
    static host = window.location.hostname;

    static getBaseUrl() {
        const port = "8001";
        return `${ApiBaseUrl.host}:${port}`;
    }

    static getAgentBaseUrl() {
        const port = "8000";
        return `${ApiBaseUrl.host}:${port}`;
    }   
    
    static getIp() {
        return ApiBaseUrl.host;
    }
}

export default ApiBaseUrl;