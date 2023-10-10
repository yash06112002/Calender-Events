import React from 'react'

const Events = ({ events }) => {
    // console.log(events)


    return (

        <div className="mt-20 mx-10">
            <div className="Title flex justify-around">
                <p>Summary</p>
                <p>Date and Time</p>
            </div>
            {

                events.map((event) => (
                    <div key={event.id} className="Events flex justify-between my-2 px-8 md:px-16">
                        <p>{event.summary || "No Summary"}</p>
                        <p>{(event.start.dateTime) || event.start.date}</p>
                    </div>
                ))

            }
        </div>
    )
}

export default Events