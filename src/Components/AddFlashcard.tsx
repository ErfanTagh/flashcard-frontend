import * as React from "react";
import {useState, useRef} from "react";
import "../assets/app.css";
import { useNavigate } from 'react-router-dom';
import styles from '../assets/Mycss.module.css'

import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import {withAuthenticationRequired, useAuth0} from "@auth0/auth0-react";  

function AddFlashcard() {

    const [inputs, setInputs] = useState({});
    const navigate = useNavigate();
    const flashref = useRef(null);
    const {user, getAccessTokenSilently} = useAuth0();

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' ,'Accept': 'application/json'
            },
            body: JSON.stringify({ token: user.email,word: inputs["title"], ans: inputs["ans"] })
        };
        fetch('/sendwords', requestOptions)
            .then(response =>

                response.json())
            .then(data => {

                console.log(data);

                if(data['status'] === 200){
                    flashref.current.show({severity: 'success', summary: 'Success', detail: 'Word Added Successfully'});
                   
                }

            }


            );

    }


    return (
        <div className="form-container">

            <form className="form-group" onSubmit={handleSubmit}>

                    <input
                        placeholder="title"
                        type="text"
                        name="title"
                        value={inputs["title"] || ""}
                        onChange={handleChange}
                        className="form-input"
                    />
                    <input
                        placeholder="value"
                        type="text"
                        name="ans"
                        value={inputs["ans"] || ""}
                        onChange={handleChange}
                        className="form-input"
                    />

            </form>
     
                <div className={"add-flashcard"}>
                        <Button className="add-flashcard-button-prime" label="Add Flashcard" onClick={handleSubmit}  />
                        
                </div>

                    

                    <Toast ref={flashref} position="bottom-right"/>


        </div>

        );

}

export default AddFlashcard;