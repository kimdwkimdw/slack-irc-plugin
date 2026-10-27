/**
 * Slack API wrapper
 * @param {object} config Slacker configuration
 * - token: Slack API token
 */
var Slacker = function (config) {
    this.token = config.token;
    return this;
};

/**
 * Send slack API request
 * @param  {string} method Slack API method
 * @param  {object} args POST arguments to send to Slack
 */
Slacker.prototype.send = async function (method, args) {
    try {
        const response = await fetch('https://slack.com/api/' + method, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(Object.assign({}, args, { token: this.token })),
            redirect: 'error',
            signal: AbortSignal.timeout(30000)
        });
        const body = await response.json();
        if (!response.ok || !body.ok) {
            console.log('Error:', body.error || 'HTTP ' + response.status);
        }
    } catch (error) {
        console.log('Error:', error.message);
    }
};

exports.Slacker = Slacker;
