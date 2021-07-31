import React from "react";
import { CellState, CellValue } from '../../types';

import "./Button.scss";

interface ButtonProps{
    row : number,
    col : number,
    red? : boolean,
    state : CellState,
    value : CellValue,
    onClick(rowParam : number, colParam : number) : (...args : any[]) => void,
    onContext(rowParam : number, colParam : number) : (...args : any[]) => void,
}

const Button:React.FC<ButtonProps> = ({row,col,onClick,onContext,state,value,red}) => {
    
    const randerContent = () : React.ReactNode => {
        if(state === CellState.visible){
            if(value === CellValue.bomb){
               return ( <span role = "img" aria-label = "bomb">💣</span>);

            }else if(value === CellValue.none){
                return null;
            }
            return value;
        }else if(state === CellState.flagged){
            //Display a flag emoji here
            return ( <span role = "img" aria-label = "bomb">📢</span>);
        }



        return null;
    }
    
    return(
        <div className={`Button ${state === CellState.visible ? "visible" : ""} value-${value} ${red ? "red" : ""}`}
        onClick = {onClick(row,col)}
        onContextMenu = {onContext(row,col)}
        >
            {randerContent()}
        </div>
    );
}

export default Button;