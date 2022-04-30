import React, { useEffect, useState } from 'react'
import {Button, Card, PageHeader, notification} from "antd";
import {ShoppingCartOutlined} from "@ant-design/icons";
import { utils, transactions } from "near-api-js";
import {login, parseTokenWithDecimals} from "../utils";
import { functionCall } from 'near-api-js/lib/transaction';
import getConfig from '../config'
import { Progress,Row, Col } from 'antd';
import {SendOutlined, DollarCircleOutlined, CrownOutlined, EllipsisOutlined,StarFilled ,CrownFilled, FrownOutlined, ThunderboltFilled , BugOutlined ,GroupOutlined} from "@ant-design/icons";

const nearConfig = getConfig(process.env.NODE_ENV || 'development')

const { Meta } = Card;

function MarketPlace() {
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
    const [data, setData] = useState([]);
    const [tokenList, setTokenList] = useState([]);
    const [lvl, setLvl] = useState(null);
    const [totalTicket, setTotalTicket] =useState(0);
    const [fundRaised, setFundRaised] =useState(0);

    async function handleBuy(item) {
        console.log(item);
        try {
           if ( !window.walletConnection.isSignedIn() ) return login();

           if (item.sale_conditions.is_native) {
            let nearBalance = await window.account.getAccountBalance();
            if (nearBalance.available < parseInt(item.sale_conditions.amount)) {
                notification["warning"]({
                    message: 'Số dư NEAR không đủ',
                    description:
                      'Tài khoản của bạn không đủ số dư để mua NFT!',
                  });

                  return;
            }

            await window.contractMarket.offer(
                {
                    nft_contract_id: item.nft_contract_id,
                    token_id: item.token_id
                },
                300000000000000,
                item.sale_conditions.amount
            )
           } else {
               // Check balance
                let UPDRABalance = await window.contractFT.ft_balance_of({account_id: window.accountId})
                if (UPDRABalance < parseInt(item.sale_conditions.amount)) {
                    notification["warning"]({
                        message: 'Số dư UPDRA không đủ',
                        description:
                        'Tài khoản của bạn không đủ số dư để mua NFT!',
                    });

                    return;
                }

               // Handle storage deposit
               let message = {
                   nft_contract_id: window.contractNFT.contractId,
                   token_id: item.token_id
               }
               const result = await window.account.signAndSendTransaction({
                   receiverId: window.contractFT.contractId,
                   actions: [
                       transactions.functionCall(
                           'storage_deposit', 
                           {account_id: item.owner_id},
                           10000000000000, 
                           utils.format.parseNearAmount("0.01")
                        ),
                       transactions.functionCall(
                           'ft_transfer_call', 
                           { receiver_id: window.contractMarket.contractId, amount: item.sale_conditions.amount, msg: JSON.stringify(message) },
                           250000000000000,
                           "1"
                        )
                   ]
               });

               console.log("Result: ", result);
           }

        } catch (e) {
            console.log("Error: ", e);
        }
    }

    useEffect(async () => {
        let totalTicket  = await window.contractNFT.nft_total_supply();
        setTotalTicket(totalTicket);
    }, []);

    useEffect(async () => {
        let fundRaised  = await window.accountTree.getAccountBalance()
            setFundRaised(fundRaised);
    }, []);

    useEffect(async () => {
        try {
            let data  = await window.contractMarket.get_sales(
                {
                    from_index: "0",
                    limit: 10
                }
            );

            let mapItemData = data.map(async item => {
                let itemData =  await window.contractNFT.nft_token({token_id: item.token_id});
                
                return {
                    ...item,
                    itemData
                }
            });
        
            let dataNew = await Promise.all(mapItemData);
            console.log("Data market: ", dataNew);
            setData(dataNew);
        } catch (e) {
            console.log(e);
        }
    }, []);

    useEffect(async () => {
        if (window.accountId) {
            // Get token list
            let tokenList = [];
            let nearBalance = await window.account.getAccountBalance();
            let UPDRABalance = await window.contractFT.ft_balance_of({account_id: window.accountId})

            tokenList.push({
                isNative: true,
                symbol: "NEAR",
                balance: nearBalance.available,
                decimals: 24,
                contractId: "near"
            });

            tokenList.push({
                isNative: false,
                symbol: "UPDRA",
                balance: UPDRABalance,
                decimals: 18,
                contractId: window.contractFT.contractId
            });

            setTokenList(tokenList);
        }
    }, []);

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
                title="Market place"
            
            />
            
            <div style={{ padding: 30, display: "flex" }}>
                {
                    data.map( nft => {
                        console.log("nft", nft);
                        return (
                            <Card
                                key={nft.token_id}
                                hoverable
                                style={{ width: 240, marginRight: 15 }}
                                cover={<img style={{height: 300, width: "100%", objectFit: "contain"}} alt="Media NFT" src={nft.itemData.metadata.media} />}
                                actions={[
                                    <Button onClick={() => handleBuy(nft)} icon={<ShoppingCartOutlined />}> Buy </Button>
                                ]}
                            >
                                <div style={{ fontSize: '20px' }}> <CrownFilled /> Planted Tree </div>
                                        
                                <Card>Rare: {stars[nft.itemData.metadata.quality-1]} </Card>

                                <h1>
                                    Sale Price: {nft.sale_conditions.is_native ? 
                                    utils.format.formatNearAmount(nft.sale_conditions.amount) + " Ⓝ":
                                    parseTokenWithDecimals(nft.sale_conditions.amount, nft.sale_conditions.decimals) + " UPDRA"
                                    }
                                </h1>
                                <Meta title={"ID: " + nft.token_id}  description={nft.owner_id} />
                            </Card>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default MarketPlace;