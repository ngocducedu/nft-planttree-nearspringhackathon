import React, { useEffect, useState} from 'react'
import {Button, Card, PageHeader, notification} from "antd";
import {SendOutlined, DollarCircleOutlined, CrownOutlined,HeartOutlined, StarFilled ,CrownFilled, FrownOutlined, ThunderboltFilled , BugOutlined ,GroupOutlined } from "@ant-design/icons";
import ModalTransferNFT from "../components/ModalTransferNFT";
import ModalSale from "../components/ModalSale";
import ModalAuction from "../components/ModalAuction";
import {default as PublicKey, transactions, utils} from "near-api-js"
import { functionCall, createTransaction } from "near-api-js/lib/transaction";
import ModalMintNFT from "../components/ModelMintNFT";
import {login, parseTokenAmount} from "../utils";
import BN from "bn.js";
import {baseDecode} from "borsh";
import getConfig from '../config'
import { Progress, Space,Radio, Row, Input,Col } from 'antd';
import { Link } from 'react-router-dom'
import element0 from '../assets/element0.png';
import element1 from '../assets/element1.png';
import element2 from '../assets/element2.png';
import element3 from '../assets/element3.png';
const element = [element0,element1,element2,element3]
const nearConfig = getConfig(process.env.NODE_ENV || 'development')
const { Meta } = Card;

function Mating() {
   const stars = [[<StarFilled style={{color:"#ff9e0d"}}/>,<StarFilled />,<StarFilled />,<StarFilled />,<StarFilled />]
    ,[<StarFilled  style={{color:"#ff9e0d"}}/>,<StarFilled  style={{color:"#ff9e0d"}}/>,<StarFilled />,<StarFilled />,<StarFilled />]
   ,[<StarFilled  style={{color:"#ff9e0d"}}/>,<StarFilled  style={{color:"#ff9e0d"}}/>,<StarFilled  style={{color:"#ff9e0d"}}/>,<StarFilled />,<StarFilled />]
   ,[<StarFilled  style={{color:"#ff9e0d"}}/>,<StarFilled  style={{color:"#ff9e0d"}}/>,<StarFilled  style={{color:"#ff9e0d"}}/>,<StarFilled  style={{color:"#ff9e0d"}}/>,<StarFilled />]
   ,[<StarFilled  style={{color:"#ff9e0d"}}/>,<StarFilled  style={{color:"#ff9e0d"}}/>,<StarFilled  style={{color:"#ff9e0d"}}/>,<StarFilled  style={{color:"#ff9e0d"}}/>,<StarFilled  style={{color:"#ff9e0d"}}/>]]
    
   const hungry = [
    [<FrownOutlined style={{color:"rgb(225 14 149)"}}/>, <FrownOutlined style={{color:"rgb(229 162 205)"}} />,<FrownOutlined style={{color:"rgb(229 162 205)"}} />,<FrownOutlined style={{color:"rgb(229 162 205)"}} />],
    [<FrownOutlined style={{color:"rgb(225 14 149)"}}/>, <FrownOutlined style={{color:"rgb(225 14 149)"}}/>,<FrownOutlined style={{color:"rgb(229 162 205)"}} />,<FrownOutlined style={{color:"rgb(229 162 205)"}} />],
    [<FrownOutlined style={{color:"rgb(225 14 149)"}}/>,<FrownOutlined style={{color:"rgb(225 14 149)"}}/>,<FrownOutlined style={{color:"rgb(225 14 149)"}}/>,<FrownOutlined style={{color:"rgb(229 162 205)"}} />],
    [<FrownOutlined style={{color:"rgb(225 14 149)"}}/>,<FrownOutlined style={{color:"rgb(225 14 149)"}}/>,<FrownOutlined style={{color:"rgb(225 14 149)"}}/>,<FrownOutlined style={{color:"rgb(225 14 149)"}}/>,],
    ];
   
   const [nfts, setNFTs] = useState([]);
    const [male, setMale] = useState();
    const [female, setFeMale] = useState();
    const [transferVisible, setTransferVisible] = useState(false);
    const [saleVisible, setSaleVisible] = useState(false);
    const [auctionVisible, setAuctionVisible] = useState(false);
    const [mintVisible, setMintVisible] = useState(false);
    const [matingVisible, setMatingtVisible] = useState(false);
    const [currentToken, setCurrentToken] = useState(null);


    useEffect(async () => {
        if (window.accountId) {
            let data  = await window.contractNFT.nft_tokens_for_owner({"account_id": window.accountId, "from_index": "0", "limit": 100});
            console.log("Data: ", data);
            setNFTs(data);
        }
    }, []);

    function handleTransferToken(token) {
        setCurrentToken(token);

        setTransferVisible(true);
    }

    function  getGas(gas) {
        return gas ? new BN(gas) : new BN('100000000000000');
    }
    function getAmount(amount) {
        return amount ? new BN(utils.format.parseNearAmount(amount)) : new BN('0');
    }

    function handleSaleToken(token) {
        setCurrentToken(token);

        setSaleVisible(true);
    }

    function handleAuctionToken(token) {
        setCurrentToken(token);

        setAuctionVisible(true);
    }

    async function submitTransfer(accountId, tokenId) {
        try {
            if (accountId && currentToken.token_id) {
                await window.contractNFT.nft_transfer(
                    {
                        receiver_id: accountId,
                        token_id: currentToken.token_id,
                        approval_id: 0,
                        memo: "Transfer to " + accountId
                    },
                    30000000000000,
                    1
                );
                setTransferVisible(false);
            }
        } catch (e) {
            console.log("Transfer error: ", e);
            setTransferVisible(false);
        } finally {
            setTransferVisible(false);
        }
    }

    async function createTransactionA({
        receiverId,
        actions,
        nonceOffset = 1,
    }) {
        const localKey = await this.connection.signer.getPublicKey(
            this.accountId,
            this.connection.networkId
        );
        let accessKey = await this.accessKeyForTransaction(
            receiverId,
            actions,
            localKey
        );
        if (!accessKey) {
            throw new Error(
                `Cannot find matching key for transaction sent to ${receiverId}`
            );
        }

        const block = await this.connection.provider.block({ finality: 'final' });
        const blockHash = baseDecode(block.header.hash);

        const publicKey = PublicKey.from(accessKey.public_key);
        const nonce = accessKey.access_key.nonce + nonceOffset;

        return createTransaction(
            this.accountId,
            publicKey,
            receiverId,
            nonce,
            actions,
            blockHash
        );
    }

    async function executeMultiTransactions(transactions, callbackUrl) {
        const nearTransactions = await Promise.all(
            transactions.map((t, i) => {
                return createTransactionA({
                    receiverId: t.receiverId,
                    nonceOffset: i + 1,
                    actions: t.functionCalls.map((fc) =>
                        functionCall(
                            fc.methodName,
                            fc.args,
                            getGas(fc.gas),
                            getAmount(fc.amount)
                        )
                    ),
                });
            })
        );

        return window.walletConnection.requestSignTransactions(nearTransactions);
    }

    async function submitOnAuction(token, startPrice, startTime, endTime) {
        try {
            if (startPrice && currentToken.token_id) {

                let auction_conditions = token === "NEAR" ? 
                        {
                            is_native: true,
                            contract_id: "near",
                            decimals: "24",
                            start_price: utils.format.parseNearAmount(startPrice.toString()),
                            start_time: startTime.toString(),
                            end_time: endTime.toString(),
                        } : {
                            is_native: false,
                            contract_id: window.contractFT.contractId,
                            decimals: "18",
                            amount: parseTokenAmount(price, 18).toLocaleString('fullwide', {useGrouping:false})
                        };

                // Check storage balance
                let storageAccount = await window.contractMarket.storage_balance_of({
                    account_id: window.accountId
                });

                // Submit auction
                if (storageAccount > 0) {
                    console.log("Data: ", storageAccount, utils.format.parseNearAmount("0.1"), nearConfig.marketContractName);
                    await window.contractNFT.nft_auction_approve({
                        token_id: currentToken.token_id,
                        account_id: nearConfig.marketContractName,
                        msg: JSON.stringify({auction_conditions})
                    },
                    30000000000000, utils.format.parseNearAmount("0.01"));
                    setAuctionVisible(false);
                } else {
                    notification["warning"]({
                        message: 'Không đủ Storage Balance',
                        description:
                          'Storage Balance của bạn không đủ để đăng bán NFT mới. Vui lòng nạp thêm tại đây!',
                      });
                }
            }

        } catch (e) {
            console.log("Transfer error: ", e);
            setTransferVisible(false);
        } finally {
            setTransferVisible(false);
        }
    }

    async function submitOnSale (token, price) {
        try {
            if (price && currentToken.token_id) {

                let sale_conditions = token === "NEAR" ? 
                        {
                            is_native: true,
                            contract_id: "near",
                            decimals: "24",
                            amount: utils.format.parseNearAmount(price.toString())
                        } : {
                            is_native: false,
                            contract_id: window.contractFT.contractId,
                            decimals: "18",
                            amount: parseTokenAmount(price, 18).toLocaleString('fullwide', {useGrouping:false})
                        };

                // Check storage balance
                let storageAccount = await window.contractMarket.storage_balance_of({
                    account_id: window.accountId
                });

                // Submit sale
                if (storageAccount > 0) {
                    console.log("Data: ", storageAccount, utils.format.parseNearAmount("0.1"), nearConfig.marketContractName);
                    await window.contractNFT.nft_approve({
                        token_id: currentToken.token_id,
                        account_id: nearConfig.marketContractName,
                        msg: JSON.stringify({sale_conditions})
                    },
                    30000000000000, utils.format.parseNearAmount("0.01"));
                    setSaleVisible(false);
                } else {
                    notification["warning"]({
                        message: 'Không đủ Storage Balance',
                        description:
                          'Storage Balance của bạn không đủ để đăng bán NFT mới. Vui lòng nạp thêm tại đây!',
                      });
                }
            }

        } catch (e) {
            console.log("Transfer error: ", e);
            setTransferVisible(false);
        } finally {
            setTransferVisible(false);
        }
    }

    async function submitOnMint() {
        // call NFT contract mint_token
        try {
            await window.contractNFT.nft_mint({
                //token_id: data.tokenId,
                receiver_id: window.accountId,
                // metadata: {
                //     title: data.tokenTitle,
                //     description: data.description,
                //     media: data.media
                // }
            }, 30000000000000, utils.format.parseNearAmount("0.01"))
        } catch (e) {
            console.log("Error: ", e);
        }
    }

    function handleClickMint() {
        if (window.walletConnection.isSignedIn()) {
            //setMintVisible(true);
            submitOnMint()
        } else {
            login();
        }
    }

    function handleClickMating() {
        if (window.walletConnection.isSignedIn()) {
            setMatingtVisible(true);
        } else {
            login();
        }
    }
    function onCheckMale(e) {
        console.log('radio checked', e.target.value);
        setMale(e.target.value)
    };
    function onCheckFemale(e) {
        console.log('radio checked', e.target.value);
        setFeMale(e.target.value)
    };

    async function matingDragon(token_id_ma, token_id_fe) {
        
        try {
            if (token_id_ma && token_id_fe) {
                await window.contractNFT.mating_dragon(
                    {
                        token_id_ma: token_id_ma,
                        token_id_fe: token_id_fe,
                    },
                    30000000000000,
                    utils.format.parseNearAmount("0.006")
                );
                
            }
        } catch (e) {
            console.log("Mating error: ", e);
        }
    
    }


    return (
        <div>
            <PageHeader
                className="site-page-header"
                title="My Collectibles"
                extra={[
                    
                    
                ]}
            />

        <Row>
            <Col span={8}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                 Male Dragon
                <div style={{ padding: 30, display: "flex"}}>
                    {console.log("nfts", nfts)}
                    <Radio.Group onChange={onCheckMale} value={1}>
                        <Space direction="vertical">
                            {
                                nfts.map((nft) => {

                                    if (nft.metadata.sex == "1") {
                                        return (
                                            <Radio value={nft.token_id}>
                                                <Card>
                                                    {stars[nft.metadata.quality-1]}<br/>
                                                    <img src={element[nft.metadata.element]} style={{width:"20px"}} alt="Element" /> <br/>
                                                    <BugOutlined /> Gen Generation : {nft.metadata.generation} <br/>
                                                    <GroupOutlined /> Gene Code: {nft.metadata.gen} <br/>
                                                    <Meta title={`${"ID: " + nft.token_id} (${nft.approved_account_ids[nearConfig.marketContractName] >= 0 ? "SALE" : "NOT SALE"})`} description={"Owner: " + nft.owner_id} />      
                                                    Sex: {nft.metadata.sex ? "Male": "Female"} <br/> 
                                                    
                                                </Card>    
                                            </Radio>
                                        )
                                    }
                                    
                                })
                            }
                        </Space>
                    </Radio.Group>
                </div>
            </Col>

            <Col span={8}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                Female Dragon
                <div style={{ padding: 30, display: "flex"}}>
                    {console.log("nfts", nfts)}
                    <Radio.Group onChange={onCheckFemale} value={2}>
                        <Space direction="vertical">
                            {
                                nfts.map((nft) => {
                                    if (nft.metadata.sex == "0") {
                                        return (
                                            <Radio value={nft.token_id}>
                                                <Card>
                                                    {stars[nft.metadata.quality-1]}<br/>
                                                    <img src={element[nft.metadata.element]} style={{width:"20px"}} alt="Element" /> <br/>
                                                    <BugOutlined /> Gen Generation : {nft.metadata.generation} <br/>
                                                    <GroupOutlined /> Gene Code: {nft.metadata.gen} <br/>
                                                    <Meta title={`${"ID: " + nft.token_id} (${nft.approved_account_ids[nearConfig.marketContractName] >= 0 ? "SALE" : "NOT SALE"})`} description={"Owner: " + nft.owner_id} />      
                                                    Sex: {nft.metadata.sex ? "Male": "Female"} <br/> 
                                                    
                                                </Card>    
                                            </Radio>
                                        )
                                    }
                                })
                            }
                        </Space>
                    </Radio.Group>
                </div>
            </Col>

            <Col span={8}>
                <div style={{ padding: 5, fontSize: 20}}>
                    <br/><br/><br/><br/><br/>      
                        Male ID is: {male} <br/><br/>
                    <HeartOutlined /><HeartOutlined /><HeartOutlined /><HeartOutlined />
                    <br/><br/>
                        Female ID is: {female} <br/><br/>
                    <Button
                        danger
                        onClick={() => matingDragon(male, female)}
                    >
                        Hybridization
                    </Button>
                </div>
            </Col>
        </Row>
            

        </div>
    )
}

export default Mating;