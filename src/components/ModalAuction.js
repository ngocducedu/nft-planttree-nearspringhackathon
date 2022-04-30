import React, { useState } from "react";
import { Modal, Input, Divider, Radio } from "antd";

function ModalAuction(props) {
    const [startPrice, setStartPrice] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [token, setToken] = useState("NEAR");

    function handleOk() {
        props.handleOk(token, startPrice, Date.parse(startTime) , Date.parse(endTime) );
        console.log(token, startPrice, Date.parse(startTime) , Date.parse(endTime) )
    }

    function handleTokenChange(e) {
        setToken(e.target.value);
    }

    return (
        <Modal title="Auction NFT" visible={props.visible} onOk={handleOk} onCancel={props.handleCancel}>
            <div style={{marginBottom: 30}}>
                <span style={{marginBottom: 10, display: "block"}}>Select token ({token}):</span>
                <Radio.Group value={token} onChange={handleTokenChange}>
                    <Radio.Button value="NEAR">NEAR</Radio.Button>
                </Radio.Group>
            </div>
            <div>
                <span style={{marginBottom: 10,  display: "block"}}>Input Start Price ({token}):</span>
                <Input type={"number"} onChange={(e) => setStartPrice(e.target.value)} placeholder={"ex: 1000 ..."} size="large" />
                <div class="form-group">
                <label for="start-time">Start Time</label>
                    <Input type="datetime-local" onChange={(e) => setStartTime(e.target.value)} id="start-time" placeholder="Start Time" />
                    {console.log(Date.parse(startTime) / 1000)}
                </div>
                <div class="form-group">
                    <label for="end-time">End Time</label>
                    <Input type="datetime-local" onChange={(e) => setEndTime(e.target.value)} id="end-time" placeholder="End Time"/>
                </div>
            </div>
        </Modal>
    )
}

export default ModalAuction