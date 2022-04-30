import React, { useEffect, useState} from 'react'
import {Button, Card, Avatar, PageHeader, notification} from "antd";
import {SendOutlined, DollarCircleOutlined, CrownOutlined, EllipsisOutlined,StarFilled ,CrownFilled, FrownOutlined, ThunderboltFilled, BugOutlined ,GroupOutlined } from "@ant-design/icons"; 
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
import { Progress, } from 'antd';
import 'antd/dist/antd.css';
import { useParams, Route } from 'react-router-dom';
import { Row, Col } from 'antd';
import element0 from '../assets/element0.png';
import element1 from '../assets/element1.png';
import element2 from '../assets/element2.png';
import element3 from '../assets/element3.png';
import { EditOutlined, SettingOutlined } from '@ant-design/icons';

const gridStyle = {
    width: '25%',
    textAlign: 'center',
  };

const nearConfig = getConfig(process.env.NODE_ENV || 'development')
const { Meta } = Card;
const element = [element0,element1,element2,element3]
function Detail() {
    const [nft, setNFT] = useState({
        owner_id: null,
        token_id: null,
        metadata: {
          title: null,
          description: null,
          media: null,
          media_hash: null,
          copies: null,
          issued_at: null,
          expires_at: null,
          starts_at: null,
          updated_at: null,
          extra: null,
          reference: null,
          reference_hash: null,
          quality: null,
          exp: null,
          power: null,
          strike: null,
          blood: null,
          physical: null,
          hunting: null,
          sex: null,
          time_born: null,
          live: null,
          feeding_times: null
        },
        approved_account_ids: {},
        royalty: {}
      });
    let nftId = useParams().id;
    let stars = [<StarFilled />,<StarFilled />,<StarFilled />,<StarFilled />,<StarFilled />];
    let hungry = [<FrownOutlined style={{color:"rgb(229 162 205)"}} />, <FrownOutlined style={{color:"rgb(229 162 205)"}} />,<FrownOutlined style={{color:"rgb(229 162 205)"}} />,<FrownOutlined style={{color:"rgb(229 162 205)"}} />];
    const winFight = <Card cover={<img alt="example" src="https://thumbs.dreamstime.com/z/game-pop-up-window-panel-buttons-victory-wins-cup-element-interface-menus-d-games-icons-dashboard-mobile-phone-143031256.jpg" />}></Card>
    const loseFight = <Card cover={<img alt="example" src="https://cdn.dribbble.com/users/96363/screenshots/3375226/062_ui_game.png" />}></Card>
    const chicken = <Card cover={<img alt="example" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMlLj2Bv6jMGhXKX8gdq4QC6vsqS_fS65G_g&usqp=CAU" />}></Card>
    const crowd = <Card cover={<img alt="example" src="http://ocxan.com/uploads/images/bap-bo-my.jpg" />}></Card>
    const [lvl, setLvl] = useState(null);
    const [transferVisible, setTransferVisible] = useState(false);
    const [saleVisible, setSaleVisible] = useState(false);
    const [auctionVisible, setAuctionVisible] = useState(false);
    const [mintVisible, setMintVisible] = useState(false);
    const [currentToken, setCurrentToken] = useState(null);
    


    useEffect(async () => {
        if (window.accountId) {
            let data  = await window.contractNFT.nft_token({token_id: nftId});
            let lvl  = await window.contractNFT.get_lvl_dragon({token_id: nftId});
            // console.log("Data: ", data);
            setNFT(data);
            setLvl(lvl);
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
    
    function get_time_to_day() {
        var dateObj = new Date();
        var month = dateObj.getMonth() + 1; //months from 1-12
        var day = dateObj.getDate();
        var year = dateObj.getFullYear();

        let today =  month + "/" + day + "/" + year;
        return today;
    }


    // Fighting
    async function setRandomFightOne(token_id) {
        
        // xem ngay hom nay co trung voi ngay cuoi cung choi hay ko
        let isPlayedAll = new Date(parseInt(nft.metadata.last_time_fight)).toLocaleString().includes(get_time_to_day());
        
        // so luot da choi hom nay
        let timesPlayed = nft.metadata.fighting_times_onday;
        //console.log("gio sin",new Date(parseInt(nft.metadata.time_born)).toLocaleString());
        //console.log('today',  (new Date() .getTime() - nft.metadata.time_born)/(60*60000));
        //console.log('today', new Date(parseInt(nft.metadata.time_born)).toLocaleString().includes(get_time_to_day()));
        if (timesPlayed==3 && isPlayedAll) {
            notification["warning"]({
                message: 'Hết lượt đánh ngày',
                description:
                  'Bạn Chỉ có thể đánh 3 lần / ngày!',
              });

                return;
            
        }
        
        try {
            if (token_id) {
                let result = await window.contractNFT.fight_monster_lvl_one(
                    {
                        token_id: token_id,
                    }
                );
                
            }
        } catch (e) {
            console.log("Fighting error: ", e);
        }
    
    }
    
    async function setRandomFightTwo(token_id) {
        
        // xem ngay hom nay co trung voi ngay cuoi cung choi hay ko
        let isPlayedAll = new Date(parseInt(nft.metadata.last_time_fight)).toLocaleString().includes(get_time_to_day());
        
        // so luot da choi hom nay
        let timesPlayed = nft.metadata.fighting_times_onday;
        //console.log("gio sin",new Date(parseInt(nft.metadata.time_born)).toLocaleString());
        //console.log('today',  (new Date() .getTime() - nft.metadata.time_born)/(60*60000));
        //console.log('today', new Date(parseInt(nft.metadata.time_born)).toLocaleString().includes(get_time_to_day()));
        if (timesPlayed==3 && isPlayedAll) {
            notification["warning"]({
                message: 'Hết lượt đánh ngày',
                description:
                  'Bạn Chỉ có thể đánh 3 lần / ngày!',
              });

                return;
            
        }
        
        try {
            if (token_id) {
                let result = await window.contractNFT.fight_monster_lvl_two(
                    {
                        token_id: token_id,
                    }
                );
                
            }
        } catch (e) {
            console.log("Fighting error: ", e);
        }
    
    }
    
    async function setRandomFightThree(token_id) {
        
        // xem ngay hom nay co trung voi ngay cuoi cung choi hay ko
        let isPlayedAll = new Date(parseInt(nft.metadata.last_time_fight)).toLocaleString().includes(get_time_to_day());
        
        // so luot da choi hom nay
        let timesPlayed = nft.metadata.fighting_times_onday;
        //console.log("gio sin",new Date(parseInt(nft.metadata.time_born)).toLocaleString());
        //console.log('today',  (new Date() .getTime() - nft.metadata.time_born)/(60*60000));
        //console.log('today', new Date(parseInt(nft.metadata.time_born)).toLocaleString().includes(get_time_to_day()));
        if (timesPlayed==3 && isPlayedAll) {
            notification["warning"]({
                message: 'Hết lượt đánh ngày',
                description:
                  'Bạn Chỉ có thể đánh 3 lần / ngày!',
              });

                return;
            
        }
        
        try {
            if (token_id) {
                let result = await window.contractNFT.fight_monster_lvl_three(
                    {
                        token_id: token_id,
                    }
                );
                
            }
        } catch (e) {
            console.log("Fighting error: ", e);
        }
    
    }
    


    // Feeding Dragon
    async function feedingDragon(token_id, live) {
        
        if (!live) {
            notification["warning"]({
                message: 'Dragon Đã Chết',
                description:
                  'Rất tiếc, Dragon của bạn đã chết !',
              });

                return;
            
        }
        
        try {
            if (token_id) {
                let result = await window.contractNFT.feeding_dragon(
                    {
                        token_id: token_id,
                    },
                    30000000000000,
                    1
                );
                
            }
        } catch (e) {
            console.log("Feeding error: ", e);
        }
    
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
                        token_id:  currentToken.token_id,
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

    async function submitOnMint(data) {
        // call NFT contract mint_token
        if (data.tokenId) {
            try {
                await window.contractNFT.nft_mint({
                    token_id: data.tokenId,
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
    }
    

    function handleClickMint() {
        if (window.walletConnection.isSignedIn()) {
            setMintVisible(true);
        } else {
            login();
        }
    }
    
    console.log(" result_last_fight", nft.metadata.result_last_fight);
    // Neu Dragon Die
    if (nft.metadata.live == false) {
        return (
            <div>
                <PageHeader
                    className="site-page-header"
                    title={nft.owner_id}
                    extra={[
                    
                    ]} 
                /> 
                
                <Row>
                <Col span={8}>
                    <div style={{ padding: 30, display: "flex"}}>
                        <Card
                            key={nft.token_id}
                            hoverable
                            style={{ width: 240, marginRight: 15, marginBottom: 15 }}
                            cover={<img style={{height: 200, width: "100%", objectFit: "contain"}} alt="nft-cover" src={"https://www.freeiconspng.com/uploads/attention-bones-death-skull-icon--8.png"} />}
                            actions={[
                                <SendOutlined onClick={() => handleTransferToken(nft)} key={"send"}/>,
                                <DollarCircleOutlined onClick={() => handleSaleToken(nft)} key={"sell"} />,
                                <CrownOutlined onClick={() => handleAuctionToken(nft)} key={"sell"} />,
                            ]}
                        >   
                            <div style={{ fontSize: '30px', textDecorationLine: 'underline' }} >Death</div> <br/>
                            <div style={{ fontSize: '20px' }}> <CrownFilled /> Level: {lvl} </div>
                            Next Level:<Progress percent={(nft.metadata.exp/(2**lvl*50))*100} /> <br/><br/><br/>
                            {
                                stars.map((item, index) => {
                                    index < nft.metadata.quality ? stars[index] = <StarFilled key={index} style={{color:"#ff9e0d"}}/> : item
                                })
                            }
                            <Card>Rarity: {stars} </Card>
                            Health :<Progress percent={nft.metadata.blood/nft.metadata.blood*100}  strokeColor="red"/>
                            <img src={element[nft.metadata.element]} style={{width:"20px"}} alt="Element" /> <br/>
                            <BugOutlined /> Gen Generation : {nft.metadata.generation} <br/>
                            <GroupOutlined /> Gene Code: {nft.metadata.gen} <br/>
                            <ThunderboltFilled /> Damage: {nft.metadata.power} <br/>
                            <ThunderboltFilled /> Critical  Damage: {nft.metadata.strike}% <br/>
                            Physical:<Progress percent={nft.metadata.physical/nft.metadata.physical*100}  strokeColor="CornflowerBlue"/>
        
                            {
                                hungry.map((item, index) => {
                                    index < Math.floor((new Date().getTime() - nft.metadata.time_born ) / 300000  - nft.metadata.feeding_times) ? hungry[index] = <FrownOutlined style={{color:"rgb(225 14 149)"}}/> : item
                                })
                            }
                            Hungry: {hungry} <br/> <br/>
                            Sex: {nft.metadata.sex ? "Male": "Female"} <br/> 
                            <br/>
                            
                            <Meta title={`${"ID: " + nft.token_id} (${nft.approved_account_ids[nearConfig.marketContractName] >= 0 ? "SALE" : "NOT SALE"})`} description={"Owner: " + nft.owner_id} />
                        </Card>
        
                    </div>
                <ModalTransferNFT visible={transferVisible} handleOk={submitTransfer} handleCancel={() => setTransferVisible(false)} />
                <ModalSale visible={saleVisible} handleOk={submitOnSale} handleCancel={() => setSaleVisible(false)} />
                <ModalAuction visible={auctionVisible} handleOk={submitOnAuction} handleCancel={() => setAuctionVisible(false)} />
                <ModalMintNFT visible={mintVisible} handleOk={submitOnMint} handleCancel={() => setMintVisible(false)} />
                </Col>

                <Col span={16}>
                    <Card title="Sorry your Dragon is dead">
                        <Card.Grid span={6} style={gridStyle}>
                            Resurrection Item 
                            <Button
                                danger
                                onClick={() => setRandomFightOne(nft.token_id)}
                            >
                                Buy
                            </Button>
                        </Card.Grid>
                        <Card.Grid span={6} style={gridStyle}>
                            Resurrection Item 
                            <Button
                                danger
                                onClick={() => setRandomFightOne(nft.token_id)}
                            >
                                Buy
                            </Button>
                        </Card.Grid><Card.Grid span={6} style={gridStyle}>
                            Resurrection Item 
                            <Button
                                danger
                                onClick={() => setRandomFightOne(nft.token_id)}
                            >
                                Buy
                            </Button>
                        </Card.Grid>
                    </Card>,
                </Col>

                </Row>
            </div>
            

        )
    } else {
        return (
            <div>
                <PageHeader
                    className="site-page-header"
                    title= {nft.owner_id}
                    extra={[
                        
                    ]} 
                />

                <Row>
                    <Col span={8}>
                        <div style={{ padding: 30, display: "flex"}}>
                            <Card
                                key={nft.token_id}
                                hoverable
                                style={{ width: 240, marginRight: 15, marginBottom: 15 }}
                                cover={<img style={{height: 200, width: "100%", objectFit: "contain"}} alt="nft-cover" src={nft.metadata.media} />}
                                actions={[
                                    <SendOutlined onClick={() => handleTransferToken(nft)} key={"send"}/>,
                                    <DollarCircleOutlined onClick={() => handleSaleToken(nft)} key={"sell"} />,
                                    <CrownOutlined onClick={() => handleAuctionToken(nft)} key={"sell"} />,
                                ]}
                            >   
                                <div style={{ fontSize: '20px' }}> <CrownFilled /> Level: {lvl} </div>
                                Next Level:<Progress percent={Math.floor((nft.metadata.exp/(2**lvl*50))*100)} /> <br/><br/><br/>
                                {
                                    stars.map((item, index) => {
                                        index < nft.metadata.quality ? stars[index] = <StarFilled key={index} style={{color:"#ff9e0d"}}/> : item
                                    })
                                }
                                <Card>Rarity: {stars} </Card>
                                Health :<Progress percent={nft.metadata.blood/nft.metadata.blood*100}  strokeColor="red"/>
                                <img src={element[nft.metadata.element]} style={{width:"20px"}} alt="Element" /> <br/>
                                <BugOutlined /> Gen Generation : {nft.metadata.generation} <br/>
                                <GroupOutlined /> Gene Code: {nft.metadata.gen} <br/>
                                <ThunderboltFilled /> Damage: {nft.metadata.power} <br/>
                                <ThunderboltFilled /> Critical  Damage: {nft.metadata.strike}% <br/>
                                Physical:<Progress percent={nft.metadata.physical/nft.metadata.physical*100}  strokeColor="CornflowerBlue"/>
            
                                {
                                    hungry.map((item, index) => {
                                        index < Math.floor((new Date().getTime() - nft.metadata.time_born ) / 300000  - nft.metadata.feeding_times) ? hungry[index] = <FrownOutlined style={{color:"rgb(225 14 149)"}}/> : item
                                    })
                                }
                                Hungry: {hungry} <br/> <br/>
                                Sex: {nft.metadata.sex ? "Male": "Female"} <br/> 
                                <br/>
                                
                                <Meta title={`${"ID: " + nft.token_id} (${nft.approved_account_ids[nearConfig.marketContractName] >= 0 ? "SALE" : "NOT SALE"})`} description={"Owner: " + nft.owner_id} />
                            </Card>
        
                        </div>
                        <ModalTransferNFT visible={transferVisible} handleOk={submitTransfer} handleCancel={() => setTransferVisible(false)} />
                        <ModalSale visible={saleVisible} handleOk={submitOnSale} handleCancel={() => setSaleVisible(false)} />
                        <ModalAuction visible={auctionVisible} handleOk={submitOnAuction} handleCancel={() => setAuctionVisible(false)} />
                        <ModalMintNFT visible={mintVisible} handleOk={submitOnMint} handleCancel={() => setMintVisible(false)} />
                    </Col>

                    <Col span={16}>
                        <Card title="Battle with the Monster">
                            <Card.Grid style={gridStyle} >
                                Result of previous Battle
                                {nft.metadata.result_last_fight == '1' ? winFight : loseFight}
                            </Card.Grid>
                            <Card.Grid style={gridStyle} >
                                <Card>Normal Difficulty: <br/> <StarFilled  style={{color:"#ff9e0d"}}/><StarFilled /><StarFilled /><br/> 
                                    <Button
                                        danger
                                        onClick={() => setRandomFightOne(nft.token_id)}
                                    >
                                        Fight
                                    </Button>
                                </Card>
                            </Card.Grid>
                            <Card.Grid style={gridStyle} >
                                <Card>Advanced Difficulty: <br/><StarFilled  style={{color:"#ff9e0d"}}/>
                                <StarFilled  style={{color:"#ff9e0d"}}/><StarFilled /><br/> 
                                    <Button
                                        danger
                                        onClick={() => setRandomFightTwo(nft.token_id)}
                                    >
                                        Fight
                                    </Button>
                                </Card>
                            </Card.Grid>
                            <Card.Grid style={gridStyle} >
                                <Card>Hell Difficulty: <br/> <StarFilled  style={{color:"#ff9e0d"}}/>
                                <StarFilled  style={{color:"#ff9e0d"}}/><StarFilled  style={{color:"#ff9e0d"}}/><br/> 
                                    <Button
                                        danger
                                        onClick={() => setRandomFightThree(nft.token_id)}
                                    >
                                        Fight
                                    </Button>
                                </Card>
                            </Card.Grid>
                            
                        </Card>,     
                        Players are allowed to play 3 times per day: <br/>
                        * Level of difficult  <StarFilled  style={{color:"#ff9e0d"}}/>: Win rate 80% --- Win: Amount of Tokens received = 1 Token + % bonus Token (level + rarity)   --- Lose: Get 0.5 Token
                        <br/>
                        * Level of difficult  <StarFilled  style={{color:"#ff9e0d"}}/><StarFilled  style={{color:"#ff9e0d"}}/><StarFilled />: Win rate 60%   --- Win: Amount of Tokens received = 3 Token + % bonus Token  (level +  rarity)   --- Lose: Get 0.5 Token
                        <br/>
                        * Level of difficult  <StarFilled  style={{color:"#ff9e0d"}}/><StarFilled  style={{color:"#ff9e0d"}}/><StarFilled  style={{color:"#ff9e0d"}}/>: Win rate 20% --- Win: Amount of Tokens received = 6 Token + % bonus Token  (level +  rarity)   --- Lose: Get 0.5 Token         
                        <br/> 
                        * Exp received 20 + 20 * level Dragon 
                        <br/> <br/> <br/> 

                        
                        <Card title="Nurturing the Dragon">
                            <Card.Grid style={gridStyle} >
                                Premium Chicken Thighs
                                {chicken}
                                <Button
                                    danger
                                    onClick={() => feedingDragon(nft.token_id,nft.metadata.live)}
                                >
                                    Feeding
                                </Button>
                            </Card.Grid>
                            <Card.Grid style={gridStyle} >
                                American Beef Cabbage
                                {crowd}
                                <Button
                                    danger
                                    onClick={() => feedingDragon(nft.token_id,nft.metadata.live)}
                                >
                                    Feeding
                                </Button>
                            </Card.Grid>
                            
                        </Card>,     
                        After every 8 hours, Dragon's hunger will increase to 1: <br/>
                        <br/>
                        ** +10 Exp + bonus % Exp theo Level <br/>
                        ** (NOTE) Hunger more than 4 . Dragon will die
                    </Col>




                </Row>

            </div>
        )
    }

    
}

export default Detail;