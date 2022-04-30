import React, { useEffect, useState } from 'react'
import {Button, Card, PageHeader, notification, Input} from "antd";
import {ShoppingCartOutlined, ArrowDownOutlined} from "@ant-design/icons";
import { utils, transactions } from "near-api-js";
import {login, parseTokenWithDecimals} from "../utils";
import { functionCall } from 'near-api-js/lib/transaction';
import {SendOutlined, DollarCircleOutlined, CrownOutlined, EllipsisOutlined,StarFilled ,CrownFilled, FrownOutlined, ThunderboltFilled , BugOutlined ,GroupOutlined} from "@ant-design/icons";
import { Progress,Row, Col } from 'antd';
import getConfig from '../config'
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
    const [lvl, setLvl] = useState(null);
    const [data, setData] = useState([]);
    const [tokenList, setTokenList] = useState([]);
    const [price, setPrice] = useState(0);
    const [totalTicket, setTotalTicket] =useState(0);
    const [fundRaised, setFundRaised] =useState(0);

    useEffect(async () => {
        if (window.accountId) {
            let totalTicket  = await window.contractNFT.nft_total_supply();
            console.log("totalTicket: ", totalTicket);
            setTotalTicket(totalTicket);
        }
    }, []);

    useEffect(async () => {
        if (window.accountId) {
            let fundRaised  = await window.accountZoo.getAccountBalance()
            console.log("fundRaised: ", fundRaised);
            setFundRaised(fundRaised);
        }
    }, []);

    async function handleBuy(item) {
        console.log(item);
        console.log(price);
        let auctionContractAndTokenId = await window.contractMarket.get_auction_contract_and_token_id({
            nft_contract_id:  item.nft_contract_id,
            token_id:item.token_id
         });

         if (window.accountId == auctionContractAndTokenId.owner_id) {
        notification["warning"]({
            message: 'Cant Bid',
            description:
                'You Cant Bid Your Auction Yourself!',
            });

            return;
        };

        if (parseInt(new Date().getTime()) < parseInt(auctionContractAndTokenId.auction_conditions.start_time)) {
        notification["warning"]({
            message: 'The Auction Hasnt Started yet',
            description:
                'Its not time to bid yet!',
            });

            return;
        };

        if (parseInt(new Date().getTime()) > parseInt(auctionContractAndTokenId.auction_conditions.end_time)) {
        notification["warning"]({
            message: 'Auction Ended',
            description:
                'Auction time is over!',
            });

            return;
        };

        if (price*1000000000000000000000000 <= auctionContractAndTokenId.current_price) {
        notification["warning"]({
            message: 'Price too low',
            description:
                'The price you give must be greater! ' + auctionContractAndTokenId.current_price/1000000000000000000000000 + " Near",
            });

            return;
        };

        try {
           if ( !window.walletConnection.isSignedIn() ) return login();

           if (item.auction_conditions.is_native) {
            let nearBalance = await window.account.getAccountBalance();
            if (nearBalance.available < parseInt(item.current_price)) {
                notification["warning"]({
                    message: 'NEAR balance is not enough',
                    description:
                      'Your account does not have enough balance to bid NFT!',
                  });

                  return;
            }

            await window.contractMarket.offer_auction(
                {
                    nft_contract_id: item.nft_contract_id,
                    token_id: item.token_id
                },
                300000000000000,
                utils.format.parseNearAmount(price.toString())
            )
           } else {
               // Check balance
                let UPDRABalance = await window.contractFT.ft_balance_of({account_id: window.accountId})
                if (UPDRABalance < parseInt(item.auction_conditions.amount)) {
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
                           { receiver_id: window.contractMarket.contractId, amount: item.auction_conditions.amount, msg: JSON.stringify(message) },
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


    async function handleClaim(item) {
        //console.log(item);
        //console.log("id: ", window.accountId);
        
        try {
           if ( !window.walletConnection.isSignedIn() ) return login();

           let auctionContractAndTokenId = await window.contractMarket.get_auction_contract_and_token_id({
               nft_contract_id:  item.nft_contract_id,
               token_id:item.token_id
            });
           console.log(auctionContractAndTokenId);
           if (window.accountId != auctionContractAndTokenId.winner) {
            notification["warning"]({
                message: 'Not Winner',
                description:
                  'You Arent Winner cannot claim NFT!',
              });

                return;
            };

            if (parseInt(new Date().getTime()) < parseInt(auctionContractAndTokenId.auction_conditions.end_time)) {
            notification["warning"]({
                message: 'Auction not over yet',
                description:
                    'The auction is not over yet cant claim NFT!',
                });

                return;
            };
            

           if (item.auction_conditions.is_native) {
            let nearBalance = await window.account.getAccountBalance();
            if (nearBalance.available < parseInt(item.current_price)) {
                notification["warning"]({
                    message: 'NEAR balance is not enough',
                    description:
                      'Your account does not have enough balance to bid NFT!',
                  });

                  return;
            }

            await window.contractMarket.claim_nft(
                {
                    nft_contract_id: item.nft_contract_id,
                    token_id: item.token_id
                },
                300000000000000,
                utils.format.parseNearAmount("0")
            ).then(() => {
                window.location.reload()
            })
           } else {
               // Check balance
                let UPDRABalance = await window.contractFT.ft_balance_of({account_id: window.accountId})
                if (UPDRABalance < parseInt(item.auction_conditions.amount)) {
                    notification["warning"]({
                        message: 'Số dư UPDRA không đủ',
                        description:
                        'Tài khoản của bạn không đủ số dư để đấu giá NFT!',
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
                           { receiver_id: window.contractMarket.contractId, amount: item.auction_conditions.amount, msg: JSON.stringify(message) },
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
        try {
            let data  = await window.contractMarket.get_auctions(
                {
                    from_index: "0",
                    limit: 20
                }
            );

            let mapItemData = data.map(async item => {
                let itemData =  await window.contractNFT.nft_token({token_id: item.token_id.toString()});
                
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
            <PageHeader
                className="site-page-header"
                title="Auction NFTs"
            />
            <div className='ticket'>
                <h1 className='ticket-tts'>Total Tickets Sold : {totalTicket}</h1>
                <h1 className='ticket-near'>Fund Raised: {parseFloat(utils.format.formatNearAmount(fundRaised.total)).toFixed(3)} Ⓝ </h1>  
                <div className='ticket-link' >
                    <a href="https://explorer.testnet.near.org/accounts/zoo-wallet-auction.louiskate.testnet" target="_blank">Check Transactions</a>
                </div>      
                <div className='ticket-guild'>
                     90% of the proceeds from the fundraising auction will go to the zoo's wallet <br/>
                </div>    
            </div>
            <div style={{ padding: 30, display: "flex" }}>
                {
                    data.map( nft => {
                        return (
                            <Card
                                key={nft.token_id}
                                hoverable
                                style={{ width: 240, marginRight: 15}}
                                cover={<img style={{height: 300, width: "100%", objectFit: "contain"}} alt="Media NFT" src={nft.itemData.metadata.media} />}
                                actions={[
                                    <Input type={"number"} onChange={(e) => setPrice(e.target.value)} placeholder={"ex: 1000 ..."} size="large" />,
                                    <Button onClick={() => handleBuy(nft)} icon={<ShoppingCartOutlined />}> Bid </Button>,
                                    <Button onClick={() => handleClaim(nft)} icon={<ArrowDownOutlined />}> Claim </Button>
                                ]}
                            >
                                <div style={{ fontSize: '20px' }}> <CrownFilled /> ZOO TICKET </div>
                                        
                                <Card>VIP: {stars[nft.itemData.metadata.quality-1]} </Card>

                                <h1>Current Price: {nft.auction_conditions.is_native ? 
                                    utils.format.formatNearAmount(nft.current_price) + " NEAR":
                                    parseTokenWithDecimals(item.auction_conditions.current_price, nft.auction_conditions.decimals) + " UPDRA"
                                }</h1>
                                <h1>Winner: {nft.winner}</h1>
                                <p>Start Time: { new Date(parseInt(nft.auction_conditions.start_time)).toLocaleString()}</p>
                                <p>End Time: { new Date(parseInt(nft.auction_conditions.end_time)).toLocaleString()}</p>
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