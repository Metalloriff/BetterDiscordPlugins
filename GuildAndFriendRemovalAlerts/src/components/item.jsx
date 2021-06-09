import React from "react";
import styles from "./item.scss";
import { joinClassNames } from "@discord/utils";
import { WebpackModules } from "@zlibrary";

const PrivateModule = WebpackModules.getByProps("openPrivateChannel");

export default function Item({ title, description, icon, clickId, closeModal }) {
    const handleClick = () => {
        PrivateModule.openPrivateChannel(clickId);
        
        closeModal();
    };
    
    return (
        <div className={joinClassNames(styles.item, styles.userItem)} onClick={handleClick}>
            <img className={styles.image} src={icon || "/assets/485a854d5171c8dc98088041626e6fea.png"} alt="image"/>
            
            <div className={styles.inner}>
                <div className={styles.title}>{ title }</div>
                { description?.length ? <div className={styles.description}>{ description }</div> : null }
            </div>
        </div>
    );
}