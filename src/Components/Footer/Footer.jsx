
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import styles from "../../assets/footerStyle.module.css";

const openTelegram=()=>{



    window.open('https://erfantagh.github.io', '_blank');

}



const Footer = () => {
return (

    <footer className={styles.footerDiv}>
        <div>
        <h5>Developed by Erfan Taghvaei</h5>
        <Button onClick={openTelegram}>Contact</Button>
        </div>



    </footer>
	
);
};
export default Footer;
