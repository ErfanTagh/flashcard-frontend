import * as React from "react";
import "../assets/app.css";
// @ts-ignore
import FlashCardItem from "./FlashCardItem.tsx";
import {getWords} from "../Service/CallApi";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {withAuthenticationRequired, useAuth0} from "@auth0/auth0-react"

import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function Flashcard() {


    const navigate = useNavigate();

    const [hasError, setErrors] = useState(false);
    const [planets, setPlanets] = useState({});
    const [click, setClicked] = useState(false);
    const {user} = useAuth0();
    const toast = useRef(null);



    useEffect(() => {

        
        async function fetchData() {
            
            const res = await fetch("/rand/" + user.email,{mode:"cors"})
       
            res
                .json()
                .then(res => {
                    
                    setPlanets(res);})
                .catch(err => {setErrors(err);});

                console.log("REssss" + res);
        }

        fetchData();
    }, []);

    async function fetchData() {

        
            const res = await fetch("/rand/" + user.email,{mode:"cors"})
        res
            .json()
            .then(res => {
               
            setPlanets(res);
        })
            .catch(err => {setErrors(err);});

            console.log("REssss" + res);
    }
    

    return (
        <div className="flashcard-container">
            <div className= "flashcard-g1">
                <FlashCardItem flashref={toast} plantsfunction = {fetchData} front={planets[0]} back={planets[1]}/>
            </div>
            <div className={"flashcard-g2"}>

                <Toast ref={toast} position="bottom-right"/>
            
            </div>

            
            
        </div>



    );
}

export default Flashcard;