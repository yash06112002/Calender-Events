import React from 'react'

const Events = ({ events }) => {
    // console.log(events)


    return <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', fontSize: "18px" }}>
            <p>Summary</p>
            <p>{ }</p>
            <p>Date and Time</p>
        </div>
        {

            events.map((event) => (
                <div key={event.id} style={{ display: "flex", justifyContent: 'space-between' }}>
                    <p>{event.summary || "No Summary"}</p>
                    <p>{Date.UTC(event.start.dateTime) || event.start.date}</p>
                </div>
            ))

        }
    </>
}

export default Events