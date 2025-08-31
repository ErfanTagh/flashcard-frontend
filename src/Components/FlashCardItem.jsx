// @ts-ignore
import FLipCard from "./FLipCard.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "../index.scss";


const cards = [

    {
        id: "2",
        variant: "click",
        front: "dummyFront",
        back: "dummyBack"
    }
];

export default function FlashCardItem({ flashref,front,back,plantsfunction}) {
    cards[0].front=front;
    cards[0].back=back;

    return (
        <div className="container">

            <div className="row h-160 ">
                <div className="col d-flex flex-column flex-md-row  align-items-center">
                    
                    {cards.map((card) => (
                        <FLipCard  flashref = {flashref} plantsfunction = {plantsfunction} key={card.id} card={card} />
                    ))}
                </div>



            </div>
        </div>
    );
}