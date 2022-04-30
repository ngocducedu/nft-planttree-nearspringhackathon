import 'regenerator-runtime/runtime'
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from "react-router"
import { login, logout } from './utils'
import Routes from "./routes";
import './global.css'
import { Layout, Menu, Button, Dropdown } from 'antd';
import 'antd/dist/antd.css';

import { MailOutlined, AppstoreOutlined, SettingOutlined, UserOutlined, VideoCameraOutlined  } from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
    const location = useLocation();
    const menu = (
        <Menu>
            <Menu.Item>
                <div onClick={logout}>
                    Logout
                </div>
            </Menu.Item>
        </Menu>
    );

  return (
      <Layout style={{minHeight: '100vh'}}>
          <Layout>
                
                <div className='menu'>    
                    <a href="/mint">
                        <img className="logo" src={require('./assets/logo-tree.gif')} alt="Logo" />    
                    </a>           
                    <div className='list-item'>
                        <ul className='menu-item font-bold'>
                            <li className='list-item-li'>
                                <Link to={"/market"} className="text-white"> Market Place </Link>
                            </li>
                            <li className='list-item-li'>
                                <Link to={"/profile"} className="text-white"> My Trees NFT </Link>
                            </li>
                            <li className='list-item-li'>
                                <Link to={"/mint"} className="text-white"> Mint NFT Plant Trees </Link>
                            </li>
                        </ul>
                    </div> 

                    <div >
                        {
                            window.walletConnection.isSignedIn() ?
                                <Dropdown overlay={menu} placement="bottomLeft" arrow>
                                    <Button className='login' type="primary" shape="round" icon={<UserOutlined />}>
                                        { window.accountId }
                                    </Button>
                                </Dropdown>:
                                <Button className='login' onClick={login} type="primary" shape="round" icon={<UserOutlined />}>
                                    Login
                                </Button>
                        }
                    </div>
                                
                </div>  
              <Content style={{ margin: '24px 16px 0' }}>
                  <div className="site-layout-background" style={{ paddingBottom: 24, paddingTop: 24, minHeight: 360 }}>
                      <Routes/>
                  </div>
              </Content>
              <Footer style={{ textAlign: 'center' }}>
                <a href="https://github.com/ngocducedu/nft-planttree-nearspringhackathon">
                    NFT PlantTree Github    
                </a> 
                </Footer>
          </Layout>
      </Layout>
  )
}