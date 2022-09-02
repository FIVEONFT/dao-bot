class ThrottleController {

    constructor() {
        this.actions = [];
        this.actionLimit = 1;
        this.actionTimeout = 60000;
    }

    canUser({ userId, actionType = 'default' }) {

        this.actions = this.actions.filter(item =>
            item.expires >= new Date().getTime());

        const userActions = this.actions.filter(item =>
            item.userId === userId);

        if (userActions.length >= this.actionLimit) {
            const oldestAction = userActions[0];
            return {
                success: false,
                waitSeconds: Math.round(-(new Date().getTime() - oldestAction.expires) / 1000)
            };
        }

        this.actions.push({
            userId,
            actionType,
            expires: new Date().getTime() + this.actionTimeout
        });

        return {
            success: true
        };
    }

}

module.exports = new ThrottleController();