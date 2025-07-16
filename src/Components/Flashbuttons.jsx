import * as React from "react";
import "../assets/app.css";

import {withAuthenticationRequired, useAuth0} from "@auth0/auth0-react";

import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { useState } from "react";
import { useEffect } from "react";
function Flashbuttons({front, back, next}) {
    const btnClassName = "p-button-danger flashcardbtn";
    const btnClassName1 = "p-button-raised flashcardbtn1";
    const reviewKey = "FFFLASHBACKCARDS";
    const {user} = useAuth0();

    const [review, setReview] = useState(back); 
    

    useEffect(()=>{


        setReview(back);
        

    },[back]);




    const reviewStatusChanged = async (f, b) => {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            token: user.email,
            oldword: f,
            word: f,
            ans: b
        })
    };

    try {
        const response = await fetch('/api/editword', requestOptions);
        const data = await response.json();
        console.log("Server response:", data);
    } catch (error) {
        console.error("Error updating word:", error);
    }
};

    const greenBtnClicked = (back) => {

        console.log(back)

        if(back.substring(back.length -16) === 'FFFLASHBACKCARDS'){

            console.log("initttttttt gbtnchanged")
            setReview(back.slice(0,-16));

            reviewStatusChanged(front,back.slice(0,-16));
         
        
        }

        next();


    }
    const redBtnClicked = (back) => {


        if( back.substring(back.length -16) != 'FFFLASHBACKCARDS'){
            setReview(back + "FFFLASHBACKCARDS");

            reviewStatusChanged(front,back + "FFFLASHBACKCARDS");



        }

        next();


    }
    return (

      
        <div className={"flashbuttons"}>
                

            <Button icon="pi pi-times" className={btnClassName} onClick= {()=> redBtnClicked(back)}/>
            
            <Button className={btnClassName1} onClick = {()=> greenBtnClicked(back)} icon="pi pi-check" iconPos="right"/>  


    
    </div>



    );
}

export default Flashbuttons;
