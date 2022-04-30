import { Modal, Divider } from "antd";
import React, { useEffect, useState} from 'react'
import { Radio, Input, Space } from 'antd';

function ModalMatingNFT(props) {
    const [tokenId, setTokenId] = useState("");
    const [nfts, setNFTs] = useState([]);
    
    useEffect(async () => {
        if (window.accountId) {
            let data  = await window.contractNFT.nft_tokens_for_owner({"account_id": window.accountId, "from_index": "0", "limit": 100});
            console.log("Data: ", data);
            setNFTs(data);
        }
    }, []);

    function handleOk() {
        props.handleOk({
            tokenId, tokenTitle, description, media
        });
    }

    function onChange(e) {
        console.log('radio checked', e.target.value);
        this.setState({
            value: e.target.value,
        });
    };

    return (
        <Modal title="LAI TẠO DRAGON" visible={props.visible} onOk={handleOk} onCancel={props.handleCancel}>
            <Radio.Group onChange={onChange} value={1}>
                <Space direction="vertical">

                    {
                        nfts.map((nft) => {
                            <Radio value={nft.tokenId}>{nft.metadata.gen}</Radio>
                        })
                    }
                </Space>
            </Radio.Group>
        </Modal>
    )
}

export default ModalMatingNFT