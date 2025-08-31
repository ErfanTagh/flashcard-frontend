import "../assets/app.css";
import { useNavigate } from 'react-router-dom';


function MainPage (){
    const navigate = useNavigate();

    function f() {

        navigate("/flashcards");

    }

        return (

            <div className={"containerg"}>

                <div className={"flashcard"}>
                    <div className={"flashcard-item"} onClick={f} >
                        <h2>Review Flashcards </h2>
                    </div>
                </div>


                <div className={"add-flashcard flashcard-blue"}>
                    <div onClick={() => navigate('/addword')}
                         className={"add-flashcard-item"}>
                        <h2>Add New Flashcards</h2>

                    </div>
                </div>

            </div>




        );

}

export default MainPage;