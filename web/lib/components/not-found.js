import React from 'react';

export default class NotFound extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div>
            <h2>You have requested a page that doesn&apos;t exist</h2>
        </div>
    }
}
