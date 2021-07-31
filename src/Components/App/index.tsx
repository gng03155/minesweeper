import React, { useState, useEffect } from "react";
import { generateCells, openMultipleCells } from '../../utils';
import NumberDisplay from '../NumberDisplay';

import { Cell, CellState, CellValue, Face } from "../../types"

import Button from "../Button"

import "./App.scss";
import { MAX_ROWS, MAX_COLS } from '../../constants';

const App: React.FC = () => {

    const [cells, setCells] = useState<Cell[][]>(generateCells());
    const [face, setFace] = useState<Face>(Face.smile);
    const [time, setTime] = useState<number>(0);
    const [live, setLive] = useState<boolean>(false);
    const [bombCounter, setBombCounter] = useState<number>(10);
    const [hasLost, setHasLost] = useState<boolean>(false);
    const [hasWon, setHasWon] = useState<boolean>(false);

    useEffect(() => {

        const handleMousedown = () => {
            setFace(Face.oh);
        };

        const handleMouseup = () => {
            setFace(Face.smile);
        };

        window.addEventListener("mousedown", handleMousedown);
        window.addEventListener("mouseup", handleMouseup);

        return () => {
            window.removeEventListener("mousedown", handleMousedown);
            window.removeEventListener("mouseup", handleMouseup);
        }

    });

    useEffect(() => {
        if (live && time <= 999) {
            const timer = setInterval(() => {
                setTime(time + 1);
            }, 1000);

            return () => {
                clearInterval(timer);
            }
        }
    }, [live, time])

    useEffect(() => {
        if (hasLost) {
            setFace(Face.lost);
            setLive(false);
        }
    }, [hasLost])

    useEffect(() => {
        if (hasWon) {
            setLive(false);
            setFace(Face.won);
        }
    }, [hasWon])

    const handleCellClick = (rowParam: number, colParam: number) => (): void => {
        if (hasLost) {
            return;
        }

        let newCells = cells.slice();
        // new Game
        if (!live) {
            let isBomb = newCells[rowParam][colParam].value === CellValue.bomb;
            while (isBomb) {
                newCells = generateCells();
                if (newCells[rowParam][colParam].value !== CellValue.bomb) {
                    isBomb = false;
                    break;
                }
            }
            setLive(true);
        }

        const currentCell = newCells[rowParam][colParam];

        if ([CellState.flagged, CellState.visible].includes(currentCell.state)) {
            return;
        }

        // 폭탄을 클릭할 경우
        if (currentCell.value === CellValue.bomb) {
            setHasLost(true);
            newCells[rowParam][colParam].red = true;
            newCells = showAllBombs();
            setCells(newCells);
            return;
        }
        // 
        else if (currentCell.value === CellValue.none) {
            newCells = openMultipleCells(newCells, rowParam, colParam);
        }
        else {
            newCells[rowParam][colParam].state = CellState.visible;
        }

        // 클리어했는지 확인
        let numberOfSafeopenCells = false;
        for (let row = 0; row < MAX_ROWS; row++) {
            for (let col = 0; col < MAX_COLS; col++) {
                const currentCell = newCells[row][col];
                if (currentCell.value !== CellValue.bomb && currentCell.state === CellState.open) {
                    numberOfSafeopenCells = true;
                    break;
                }
            }
        }

        if (!numberOfSafeopenCells) {
            newCells = newCells.map(row => row.map(cell => {
                if (cell.value === CellValue.bomb) {
                    return {
                        ...cell,
                        state: CellState.flagged,
                    }
                }
                return cell;
            }))
            setHasWon(true);
        }

        setCells(newCells);
    }

    const handleFaceClick = (): void => {

        setLive(false);
        setTime(0);
        setCells(generateCells());
        setHasLost(false);
        setHasWon(false);
    }

    const handleCellContext = (rowParam: number, colParam: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
        e.preventDefault();

        if (!live) {
            return;
        }

        const currentCells = cells.slice();
        const currentCell = cells[rowParam][colParam];

        if (currentCell.state === CellState.visible) {
            return;
        } else if (currentCell.state === CellState.open) {
            currentCells[rowParam][colParam].state = CellState.flagged;
            setCells(currentCells);
            setBombCounter(bombCounter - 1);
        } else if (currentCell.state === CellState.flagged) {
            currentCells[rowParam][colParam].state = CellState.open;
            setCells(currentCells);
            setBombCounter(bombCounter + 1);
        }


    }

    const renderCell = (): React.ReactNode => {
        return cells.map((row, rowIndex) =>
            row.map((cell, colIndex) =>
                <Button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={handleCellClick}
                    onContext={handleCellContext}
                    red={cell.red}
                    row={rowIndex}
                    col={colIndex}
                    state={cell.state}
                    value={cell.value}
                />
            )
        )
    };

    const showAllBombs = (): Cell[][] => {
        const currentCells = cells.slice();
        return currentCells.map(row => row.map(cell => {
            if (cell.value === CellValue.bomb) {
                return {
                    ...cell,
                    state: CellState.visible,
                }
            }
            return cell;
        })
        );
    }

    return (
        <div className="App">
            <div className="Header">
                <NumberDisplay value={bombCounter} />
                <div className="Face" onClick={handleFaceClick}><span role="img" aria-label="face">{face}</span></div>
                <NumberDisplay value={time} />
            </div>
            <div className="Body"
                style={{
                    gridTemplateRows: `repeat(${MAX_ROWS}, 1fr)`,
                    gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)`
                }
                }

            >{renderCell()}</div>
        </div>
    )
}

export default App;