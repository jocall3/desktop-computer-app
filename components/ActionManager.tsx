import React from 'react';

type ActionCallback = (payload: any) => void;

export class ActionManager extends React.Component {
    private static actions = new Map<string, ActionCallback>();

    static registerAction(id: string, callback: ActionCallback) {
        this.actions.set(id, callback);
    }

    static executeAction(id: string, payload?: any) {
        const action = this.actions.get(id);
        if (action) {
            console.log(`ActionManager: Executing ${id}`, payload);
            action(payload);
        } else {
            console.warn(`ActionManager: Action ${id} not found`);
        }
    }

    render() {
        return null; // Logic-only component
    }
}