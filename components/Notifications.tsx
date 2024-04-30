

function Notifications() {
    return (
        <div id="notification-area" className="c-notificationgroup">


            {/*Success message */}
            <div id="js-notification-info" className="c-notification--info hide" role="alert">
            </div>

            <div id="js-notification-warning" className="c-notification--warning" role="alert">
                <p></p>
                <p></p><p>This is the staging environment of the DMPTool. Do not enter real data into this site- for testing only!</p><p></p>
            </div>

            {/*Error message */}
            <div id="js-notification-danger" className="c-notification--danger hide" role="alert">
            </div>
        </div>
    )
}

export default Notifications;