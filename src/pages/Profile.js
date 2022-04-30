import React, { useEffect, useState} from 'react'
import {Button, Card, PageHeader, notification} from "antd";
import {SendOutlined, DollarCircleOutlined, CrownOutlined, StarFilled ,CrownFilled, FrownOutlined, ThunderboltFilled , BugOutlined ,GroupOutlined } from "@ant-design/icons";
import ModalTransferNFT from "../components/ModalTransferNFT";
import ModalSale from "../components/ModalSale";
import ModalAuction from "../components/ModalAuction";
import {default as PublicKey, transactions, utils} from "near-api-js"
import { functionCall, createTransaction } from "near-api-js/lib/transaction";
import ModalMintNFT from "../components/ModelMintNFT";
import ModalMatingNFT from "../components/ModalMatingNFT";
import {login, parseTokenAmount} from "../utils";
import BN from "bn.js";
import {baseDecode} from "borsh";
import getConfig from '../config'
import { Progress,Row, Col } from 'antd';
import { Link } from 'react-router-dom'
import element0 from '../assets/element0.png';
import element1 from '../assets/element1.png';
import element2 from '../assets/element2.png';
import element3 from '../assets/element3.png';

const nearConfig = getConfig(process.env.NODE_ENV || 'development')
const { Meta } = Card;

function Profile() {
    const element = [element0,element1,element2,element3]
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
    const [transferVisible, setTransferVisible] = useState(false);
    const [saleVisible, setSaleVisible] = useState(false);
    const [auctionVisible, setAuctionVisible] = useState(false);
    const [mintVisible, setMintVisible] = useState(false);
    const [matingVisible, setMatingtVisible] = useState(false);
    const [currentToken, setCurrentToken] = useState(null);
    const [totalTicket, setTotalTicket] =useState(0);
    const [fundRaised, setFundRaised] =useState(0);

    useEffect(async () => {
        if (window.accountId) {
            let data  = await window.contractNFT.nft_tokens_for_owner({"account_id": window.accountId, "from_index": "0", "limit": 100});
            console.log("Data: ", data);
            setNFTs(data);
        }
    }, []);

    useEffect(async () => {
        let totalTicket  = await window.contractNFT.nft_total_supply();
        setTotalTicket(totalTicket);
    }, []);

    useEffect(async () => {
        let fundRaised  = await window.accountTree.getAccountBalance()
            setFundRaised(fundRaised);
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
                        message: 'Not enough Storage Balance',
                        description:
                          'Your Storage Balance is not enough to sell on a new NFT. Please refill!',
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
                        message: 'Not enough Storage Balance',
                        description:
                          'Your Storage Balance is not enough to sell on a new NFT. Please refill!',
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

    async function handleDeposit() {
        if (window.walletConnection.isSignedIn()) {
            await window.contractMarket.storage_deposit(
                {
                    account_id: window.accountId,
                },
                30000000000000,
                utils.format.parseNearAmount("1")
            )
        } else {
            login();
        }
    }
    

    async function handleRegisToken() {
        if (window.walletConnection.isSignedIn()) {
            await window.contractFT.storage_deposit(
                {
                    account_id: window.accountId,
                },
                30000000000000,
                utils.format.parseNearAmount("0.01")
            )
        } else {
            login();
        }
    }

    return (
        <div>
            <div className='ticket'>
                <h1 className='ticket-tts'>Total trees planted : {totalTicket}</h1>
                <h1 className='ticket-near'>Fund Raised: {parseFloat(utils.format.formatNearAmount(fundRaised.total)).toFixed(3)} Ⓝ </h1>  
                <div className='ticket-link' >
                    <a href="https://explorer.testnet.near.org/accounts/plant-tree-fund.louiskate.testnet" target="_blank">Check Transactions</a>
                </div>    
                  
            </div>
            <PageHeader
                className="site-page-header"
                title="My NFT Plant Tree"
                extra={[
                    <Button onClick={handleDeposit} key="4">Deposit Storage</Button>,
                ]}
            />

        <Row span={16} >
            <Col span={8}>
                <div style={{ padding: 30, display: "wrap" }}>
                    {
                        nfts.map((nft) => {
                            if (nft.metadata.sex == "1") {
                                // check xem dragon die
                                return (
                                    <Card
                                        key={nft.token_id}
                                        hoverable
                                        style={{ width: 240, marginRight: 15, marginBottom: 15, flexWrap: "wrap" }}
                                        cover={<img style={{height: 200, width: "100%", objectFit: "contain"}} alt="nft-cover" src={nft.metadata.media} />}
                                        actions={[
                                            <b onClick={() => handleTransferToken(nft)} key={"send"}><SendOutlined /> <br/>Transfer NFT</b>,
                                            <b onClick={() => handleSaleToken(nft)} key={"sell"}><DollarCircleOutlined /> <br/>Sell NFT</b>,
                                        ]}
                                    >
                                        <div style={{ fontSize: '20px' }}> <CrownFilled /> Planted Tree </div>
                                        
                                        <Card>Rare: {stars[nft.metadata.quality-1]} </Card> <br/>
                                    
                                        <Meta title={`${"ID: " + nft.token_id} (${nft.approved_account_ids[nearConfig.marketContractName] >= 0 ? "SALE" : "NOT SALE"})`} description={"Owner: " + nft.owner_id} />
                                    </Card>
                                )
                            }


                        })
                    }
                </div>
                <ModalTransferNFT visible={transferVisible} handleOk={submitTransfer} handleCancel={() => setTransferVisible(false)} />
                <ModalSale visible={saleVisible} handleOk={submitOnSale} handleCancel={() => setSaleVisible(false)} />
                <ModalAuction visible={auctionVisible} handleOk={submitOnAuction} handleCancel={() => setAuctionVisible(false)} />
                <ModalMintNFT visible={mintVisible} handleOk={submitOnMint} handleCancel={() => setMintVisible(false)} />
                <ModalMatingNFT visible={mintVisible} handleOk={submitOnMint} handleCancel={() => setMatingVisible(false)} />        
            </Col>

            <Col span={8}>
                <div style={{ padding: 30, display: "wrap" }}>
                    {
                        nfts.map((nft) => {
                            if (nft.metadata.sex == "0") {
                                return (
                                    <Card
                                        key={nft.token_id}
                                        hoverable
                                        style={{ width: 240, marginRight: 15, marginBottom: 15, flexWrap: "wrap" }}
                                        cover={<img style={{height: 200, width: "100%", objectFit: "contain"}} alt="nft-cover" src={nft.metadata.media} />}
                                        actions={[
                                            <b onClick={() => handleTransferToken(nft)} key={"send"}><SendOutlined /> <br/>Transfer NFT</b>,
                                            <b onClick={() => handleSaleToken(nft)} key={"sell"}><DollarCircleOutlined /> <br/>Sell NFT</b>,
                                        ]}
                                    >
                                        <div style={{ fontSize: '20px' }}> <CrownFilled /> Planted Tree </div>
                                        
                                        <Card>Rare: {stars[nft.metadata.quality-1]} </Card> <br/>
                                        
                                        <Meta title={`${"ID: " + nft.token_id} (${nft.approved_account_ids[nearConfig.marketContractName] >= 0 ? "SALE" : "NOT SALE"})`} description={"Owner: " + nft.owner_id} />
                                    </Card>
                                )
                            }


                        })
                    }
                </div>
                <ModalTransferNFT visible={transferVisible} handleOk={submitTransfer} handleCancel={() => setTransferVisible(false)} />
                <ModalSale visible={saleVisible} handleOk={submitOnSale} handleCancel={() => setSaleVisible(false)} />
                <ModalAuction visible={auctionVisible} handleOk={submitOnAuction} handleCancel={() => setAuctionVisible(false)} />
                <ModalMintNFT visible={mintVisible} handleOk={submitOnMint} handleCancel={() => setMintVisible(false)} />
                <ModalMatingNFT visible={mintVisible} handleOk={submitOnMint} handleCancel={() => setMatingVisible(false)} />        
            </Col>
        </Row>
            

        </div>
    )
}

export default Profile;