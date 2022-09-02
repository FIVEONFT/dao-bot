const fetch = require('isomorphic-fetch');
const config = require('../config/config.js');

class VercelBuildController {

    constructor() {
        this.lastBuiltTime = 0;
        this.timer = null;
    }

    build() {
        const lastBuilt = this.lastBuiltTime;
        const timeNow = new Date().getTime();
        const timeDiff = timeNow - config.vercel.timeout;

        if (lastBuilt < timeDiff) {
            return this.performBuild();
        } else {
            if (this.timer) {
                // timer already set, will build soon
            } else {
                this.timer = setTimeout(async () => {
                    if (this.timer) this.timer = null;
                    await this.performBuild();
                }, lastBuilt - timeDiff);
            }
        }
    }

    performBuild() {
        this.lastBuiltTime = new Date().getTime();
        return fetch(config.vercel.hook, {
            method: 'POST'
        });
    }
}

module.exports = new VercelBuildController();