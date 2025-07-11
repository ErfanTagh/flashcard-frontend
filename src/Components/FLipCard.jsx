import { useState } from "react";
import * as cn from "classnames";
import React from "react";
import DropDown from "./DropDown.jsx";
import  { useRef, useEffect } from "react";
import { useAuth0} from "@auth0/auth0-react";
import styles from "../assets/myCss.module.css";
import Flashbuttons from "./Flashbuttons.jsx";


function FlipCard({flashref, plantsfunction,card }) {
    const [showBack, setShowBack] = useState(false);
    const [inputs, setInputs] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [front,setfront] = useState(card.front);
    const [back,setback] = useState(card.back);

    const [error,setError] = useState({})

    const [inReview,setInReview] = useState(false);

    const {user} = useAuth0();
    const backclasses = `card-text fs-1 fw-bold ${styles.card}`;

    useEffect( () => {
        setShowBack(false);
        setEditMode(false);

        if(card.back!=undefined && card.back.substring(card.back.length - 16) === "FFFLASHBACKCARDS"){


                
            setInReview(true);
            setback(card.back);
            


        }
        else if(card.back!=undefined ){
        setback(card.back);}
        setfront(card.front);

    
        setInputs(values => ({...values, "title": card.front,"ans": card.back}))

    },[card.front,card.back]);


     useEffect( () => {

        if(back!=undefined && back.substring(back.length - 16) === "FFFLASHBACKCARDS"){

            setInReview(true);                        

        }else{

            setInReview(false);                        

        }

        

    },[back]);
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
    }

    async function fetchData() {

   
        
        const res = await fetch("/words/rand/" + user.email)
        res
            .json()
            .then(res => { 


                console.log(res);
                
                setfront(res[0]);
                setback(res[1]);

                setShowBack(false);
                setEditMode(false);
                if(back!=undefined && back.substring(back.length - 16) === "FFFLASHBACKCARDS"){

                    setInReview(true);
        
        
                }else{

                    setInReview(false);
                }

      
            })
            .catch(err => setError(err));
}

    function handleClick() {
        if (card.variant === "click") {
            setShowBack(!showBack);
        }
    }

    function handleCancel () {
        setInputs(values => ({...values, "title": card.front,"ans": card.back}))
        setEditMode(false);
    }


    const processBack = () => {

        if(back.substring(back.length  - 16 ) === "FFFLASHBACKCARDS")
         {
            
            return back.slice(0,-16);


        }else{


            return back;
        }



    }

    const handleSubmit = (event) => {
        event.preventDefault();


        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' ,'Accept': 'application/json'
            },
            body: JSON.stringify({  token: user.email, oldword:card.front ,word: inputs["title"], ans: inputs["ans"] })
        };
        fetch('/editword', requestOptions)
            .then(response =>

                response.json())
            .then(data => {

                console.log(data);

                if(data['status'] === 200){
                    flashref.current.show({severity: 'success', summary: 'Success', detail: 'Edit Successful'});
                    setfront(inputs["title"]);
                    setback(inputs["ans"]);
                    
                    setEditMode(false);

                }

            });

    }

    return (
        <div
            className="flip-card-outer"
            
        >
            <div
                className={cn("flip-card-inner", {
                    showBack,
                    "hover-trigger": card.variant === "hover"
                })}>
                     

                <div className="card front ">
                    <div className={styles.topbar} >
                                <p  style={{ visibility: inReview ? "visible" : "hidden" }} className={styles.reviewtext}>Reviewing</p>
                    </div>
                    <div onClick={handleClick} className="card-body d-flex justify-content-center align-items-center">

                        <p className="card-text fs-1 fw-bold">{front}</p>
                    </div>
                    
                </div>
              
                    <div className="card back">
                        <div className={styles.topbar}>
                            <p style={{ visibility: inReview ? "visible" : "hidden" }} className={styles.reviewtext}>Reviewing</p>
                            <DropDown flashref={flashref} plantsfunction={plantsfunction} etmode ={setEditMode} front={front}/>
                        </div>
                        
                        <div   onClick={editMode === false ? handleClick : ()=>{}} className="card-body d-flex flex-column justify-content-around align-items-center ">
                        { showBack===true && (editMode===false ? <p className="card-text fs-1 fw-bold ">{front}</p> 

                                    : <input type="text"
                                    name="title"
                                    value={inputs["title"] || ""}
                                    onChange={handleChange}
                                    className="form-control form-control-lg mt-5"
                                    ></input> )}
                            { showBack===true && (editMode===false ? <p className={backclasses} >{processBack()}</p> 
                        
                            : <input type="text"
                            name="ans"
                            value={inputs["ans"] || ""}
                            onChange={handleChange}
                            className="form-control form-control-lg"
                            ></input> )}
                            {editMode===true && <div className="w-100 d-flex flex-row-reverse justify-content-evenly">
                                
                            <button type="submit" onClick={handleSubmit} className="btn btn-success btn-lg btn-circle ">Apply</button>
                            <button onClick={handleCancel}  className="btn btn-light btn-lg btn-circle">cancel</button>
                                
                                </div>}
                                       
                        </div>


                        <Flashbuttons next={fetchData} front={front} back={back} />
                    </div>
                </div>

     


        </div>
    );
}

export default FlipCard;