import { useState } from "react";
import * as cn from "classnames";
import React from "react";
import "../assets/app.css";
import AddFlashcard from "./AddFlashcard";
import  { useRef, useEffect } from "react";
import { useAuth0} from "@auth0/auth0-react";



function DropDown({ flashref, front,etmode,plantsfunction}) {

    function useOutsideAlerter(ref) {
        useEffect(() => {
          /**
           * Alert if clicked on outside of element
           */
          function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
              console.log("You clicked outside of me!");
                setClass("dropdown-content");
            }
          }
          // Bind the event listener
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
          };
        }, [ref]);
      }
    
      const {user} = useAuth0();

    const [cl, setClass] = useState("dropdown-content");
    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef);

    function showDropdown(){
        if(cl==="dropdown-content"){
        setClass("dropdown-content show");}
        else{
            setClass("dropdown-content");}        

    }


    function deleteCard(){

        const requestOptions = {
          method: 'Delete',
          headers: { 'Content-Type': 'application/json' ,'Accept': 'application/json'
          },
          body: JSON.stringify({  token: user?.email })
      };
        fetch('/api/delword/' + front, requestOptions)
            .then(response =>

                response.json())
            .then(data => {if(data['status'] === 200){
              flashref.current.show({severity: 'success', summary: 'Success', detail: 'Delete Successful'});

                plantsfunction();


            }});



    }

    function editFlashcard(){


        etmode(true);


    }



    return (

                <div  ref={wrapperRef} className="position-absolute top-0 end-0 ">
                       
                    <ul className = "dropbtn icons btn-right showLeft" onClick={showDropdown}>
                    <li></li>
                    <li></li>
                    <li></li>
                    </ul>
                    
                    <div id="myDropdown" className={cl}>
                    <a href="#" onClick={editFlashcard}>Edit</a>
                    <a href="#" onClick={deleteCard}>Delete</a>
                    </div>


                    
                    
                </div>
           
    );
}

export default DropDown;
