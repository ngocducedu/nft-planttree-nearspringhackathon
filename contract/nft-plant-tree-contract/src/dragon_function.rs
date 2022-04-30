use crate::*;

//GAS constants to attach to calls
const GAS_FOR_ROYALTIES: Gas = 115_000_000_000_000;
const GAS_FOR_NFT_TRANSFER: Gas = 15_000_000_000_000;
const GAS_FOR_FT_TRANSFER: Gas = 15_000_000_000_000;
//constant used to attach 0 NEAR to a call
const NO_DEPOSIT: Balance = 0;

// Add ham tu ft token ben ngoai
#[ext_contract(ext_ft_contract)]
pub trait FungibleTokenCore {
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>);
}

#[ext_contract(ext_self)]
pub trait MarketContract {
    fn ft_resolve_purchase(&mut self, ft_contract_id: AccountId, price: U128, owner_nft: AccountId) -> Promise;
}

#[near_bindgen]
impl Contract {
    pub fn get_lvl_dragon(&self, token_id: &TokenId) -> u64 {
        fn log2u(n: f64) -> f64 {
            n.log2().ceil()
        }
        let token = self.tokens_by_id.get(&token_id).expect("Not found token");
        let mut token_metadata = self.token_metadata_by_id.get(&token_id).expect("Not found token");
        let mut exp = token_metadata.exp.unwrap();

        (log2u(exp as f64 / 50.0) + 1.0 ) as u64
    }

    #[payable] 
    pub fn feeding_dragon(&mut self, token_id: &TokenId) -> u64 {
        assert_one_yocto();
        let token = self.tokens_by_id.get(&token_id).expect("Not found token");
        let lvl_dragon = self.get_lvl_dragon(&token_id);
        let mut token_metadata = self.token_metadata_by_id.get(&token_id).expect("Not found token");
        assert!(&token_metadata.live.unwrap(), "Dragon is dead");

        // tinh so luong can feeding theo timestamp
        let mut feeding_times = token_metadata.feeding_times.unwrap();
        let mut exp = token_metadata.exp.unwrap();
        let mut power = token_metadata.power.unwrap();
        let  strike = token_metadata.strike.unwrap();
        let mut blood = token_metadata.blood.unwrap();
        let time_born = u64::from(token_metadata.time_born.unwrap());
        let need_feeding_by_time_born = ((env::block_timestamp() / 1_000_000) - time_born) / 28800000;
        if need_feeding_by_time_born > feeding_times {
            if (need_feeding_by_time_born - feeding_times) <= 4 {
                feeding_times = feeding_times + 1;
                exp = exp + 10;
                exp = exp + 10*lvl_dragon;
                power = u128::from(lvl_dragon) * 50 * u128::from(strike);
                blood = u128::from(lvl_dragon) * 320 * u128::from(strike);
                token_metadata.feeding_times = Some(feeding_times);
                token_metadata.exp = Some(exp);
                token_metadata.blood = Some(blood);
                token_metadata.power = Some(power);
            } else {
                token_metadata.live = Some(false);
            };
        }  else {
            return need_feeding_by_time_born - feeding_times;
        }
            
        self.token_metadata_by_id.insert(&token_id, &token_metadata);
        
        need_feeding_by_time_born - feeding_times
    }

    #[payable] 
    pub fn fight_monster_lvl_one(&mut self, token_id: &TokenId) -> bool {
        //let nft_contract_id = env::predecessor_account_id();
        let token = self.tokens_by_id.get(&token_id).expect("Not have this Token");
        let lvl_dragon = self.get_lvl_dragon(&token_id);
        let mut token_metadata = self.token_metadata_by_id.get(&token_id).expect("Not found token");
        
        // tinh so lan co the fighting trong ngay
        let mut fighting_times = token_metadata.fighting_times.unwrap();
        let mut fighting_times_onday = token_metadata.fighting_times_onday.unwrap();
        let mut exp = token_metadata.exp.unwrap();
        let mut power = token_metadata.power.unwrap();
        let  strike = token_metadata.strike.unwrap();
        let mut blood = token_metadata.blood.unwrap();
        let mut last_time_fight = u64::from(token_metadata.last_time_fight.unwrap());
        let time_born = u64::from(token_metadata.time_born.unwrap());

        // so lan can phai feeding moi 5 phut. Cu 5phut dc feeding 3 lan
        let need_fighting_by_time_born = 3 * ((env::block_timestamp() / 1_000_000) - time_born + 300000) / 300000;

        if (fighting_times >= need_fighting_by_time_born) {

           panic!("Play too much in day!");
           
        } else {
            if(fighting_times_onday >= 3) {
                token_metadata.fighting_times_onday = Some(0);
                self.token_metadata_by_id.insert(&token_id, &token_metadata);
            };

            if ( (need_fighting_by_time_born - fighting_times) > 3 ) {
                fighting_times = need_fighting_by_time_born -3;
            } 
            let mut token_metadata = self.token_metadata_by_id.get(&token_id).expect("Not found token");
            let mut fighting_times_onday = token_metadata.fighting_times_onday.unwrap();
            fighting_times = fighting_times + 1;
            fighting_times_onday = fighting_times_onday + 1;
            last_time_fight = env::block_timestamp() / 1_000_000;
            exp = exp + 20;
            exp = exp + 20*lvl_dragon;
            power = u128::from(lvl_dragon) * 50 * u128::from(strike);
            blood = u128::from(lvl_dragon) * 320 * u128::from(strike);
            token_metadata.exp = Some(exp);
            token_metadata.blood = Some(blood);
            token_metadata.fighting_times = Some(fighting_times);
            token_metadata.power = Some(power);
            token_metadata.last_time_fight = Some(U64(last_time_fight));
            token_metadata.fighting_times_onday = Some(fighting_times_onday);



            // random ra thang thua
            let rdnum = env::block_timestamp() % 100;
            let percent = match rdnum {
                10..=15 => Some(0),
                30..=38 => Some(0),
                60..=67 => Some(0),
                _ => Some(1)
            };

            // when win
            if (percent == Some(1)) {
                let quality = token_metadata.quality.unwrap();
                let bonues = u128::from(lvl_dragon) * u128::from(quality);
                let amount = 1000000000000000000000000 + (1000000000000000000000000 * bonues / 100);
                // chuyen token cho user khi fighting xong 
                ext_ft_contract::ft_transfer(
                    token.owner_id,
                    U128(amount),
                    None,
                    &"16updragon-token.ngocduct.testnet",
                    1,
                    GAS_FOR_FT_TRANSFER
                );
                token_metadata.result_last_fight = Some(1);
                self.token_metadata_by_id.insert(&token_id, &token_metadata);
                return true;
            } else {
                //lose
                ext_ft_contract::ft_transfer(
                    token.owner_id,
                    U128(1000000000000000000000000/2),
                    None,
                    &"16updragon-token.ngocduct.testnet",
                    1,
                    GAS_FOR_FT_TRANSFER
                );
                token_metadata.result_last_fight = Some(0);
                self.token_metadata_by_id.insert(&token_id, &token_metadata);
                return false;
            }

        }
    }

    #[payable] 
    pub fn fight_monster_lvl_two(&mut self, token_id: &TokenId) -> bool {
        //let nft_contract_id = env::predecessor_account_id();
        let token = self.tokens_by_id.get(&token_id).expect("Not have this Token");
        let lvl_dragon = self.get_lvl_dragon(&token_id);
        let mut token_metadata = self.token_metadata_by_id.get(&token_id).expect("Not found token");
        
        // tinh so lan co the fighting trong ngay
        let mut fighting_times = token_metadata.fighting_times.unwrap();
        let mut fighting_times_onday = token_metadata.fighting_times_onday.unwrap();
        let mut exp = token_metadata.exp.unwrap();
        let mut power = token_metadata.power.unwrap();
        let  strike = token_metadata.strike.unwrap();
        let mut blood = token_metadata.blood.unwrap();
        let mut last_time_fight = u64::from(token_metadata.last_time_fight.unwrap());
        let time_born = u64::from(token_metadata.time_born.unwrap());

        // so lan can phai fight moi 5 phut. Cu 5phut dc fight 3 lan
        let need_fighting_by_time_born = 3 * ((env::block_timestamp() / 1_000_000) - time_born + 300000) / 300000;

        if (fighting_times >= need_fighting_by_time_born) {

           panic!("Play too much in day!");
           
        } else {
            if(fighting_times_onday >= 3) {
                token_metadata.fighting_times_onday = Some(0);
                self.token_metadata_by_id.insert(&token_id, &token_metadata);
            };

            if ( (need_fighting_by_time_born - fighting_times) > 3 ) {
                fighting_times = need_fighting_by_time_born -3;
            } 
            let mut token_metadata = self.token_metadata_by_id.get(&token_id).expect("Not found token");
            let mut fighting_times_onday = token_metadata.fighting_times_onday.unwrap();
            fighting_times = fighting_times + 1;
            fighting_times_onday = fighting_times_onday + 1;
            last_time_fight = env::block_timestamp() / 1_000_000;
            exp = exp + 20;
            exp = exp + 20*lvl_dragon;
            power = u128::from(lvl_dragon) * 50 * u128::from(strike);
            blood = u128::from(lvl_dragon) * 320 * u128::from(strike);
            token_metadata.exp = Some(exp);
            token_metadata.blood = Some(blood);
            token_metadata.fighting_times = Some(fighting_times);
            token_metadata.power = Some(power);
            token_metadata.last_time_fight = Some(U64(last_time_fight));
            token_metadata.fighting_times_onday = Some(fighting_times_onday);



            // random ra thang thua
            let rdnum = env::block_timestamp() % 100;
            let percent = match rdnum {
                10..=15 => Some(1),
                26..=29 => Some(1),
                52..=57 => Some(1),
                81..=85 => Some(1),
                74..=77 => Some(1),
                30..=39 => Some(1),
                64..=69 => Some(1),
                44..=49 => Some(1),
                _ => Some(0)
            };

            // when win
            if (percent == Some(1)) {
                let quality = token_metadata.quality.unwrap();
                let bonues = u128::from(lvl_dragon) * u128::from(quality);
                let amount = 3000000000000000000000000 + (3000000000000000000000000 * bonues / 100);
                // chuyen token cho user khi fighting xong 
                ext_ft_contract::ft_transfer(
                    token.owner_id,
                    U128(amount),
                    None,
                    &"16updragon-token.ngocduct.testnet",
                    1,
                    GAS_FOR_FT_TRANSFER
                );
                token_metadata.result_last_fight = Some(1);
                self.token_metadata_by_id.insert(&token_id, &token_metadata);
                return true;
            } else {
                //lose
                ext_ft_contract::ft_transfer(
                    token.owner_id,
                    U128(1000000000000000000000000/2),
                    None,
                    &"16updragon-token.ngocduct.testnet",
                    1,
                    GAS_FOR_FT_TRANSFER
                );
                token_metadata.result_last_fight = Some(0);
                self.token_metadata_by_id.insert(&token_id, &token_metadata);
                return false;
            }

        }
    }

    #[payable] 
    pub fn fight_monster_lvl_three(&mut self, token_id: &TokenId) -> bool {
        //let nft_contract_id = env::predecessor_account_id();
        let token = self.tokens_by_id.get(&token_id).expect("Not have this Token");
        let lvl_dragon = self.get_lvl_dragon(&token_id);
        let mut token_metadata = self.token_metadata_by_id.get(&token_id).expect("Not found token");
        
        // tinh so lan co the fighting trong ngay
        let mut fighting_times = token_metadata.fighting_times.unwrap();
        let mut fighting_times_onday = token_metadata.fighting_times_onday.unwrap();
        let mut exp = token_metadata.exp.unwrap();
        let mut power = token_metadata.power.unwrap();
        let  strike = token_metadata.strike.unwrap();
        let mut blood = token_metadata.blood.unwrap();
        let mut last_time_fight = u64::from(token_metadata.last_time_fight.unwrap());
        let time_born = u64::from(token_metadata.time_born.unwrap());

        // so lan can phai fight moi 5 phut. Cu 5phut dc fight 3 lan
        let need_fighting_by_time_born = 3 * ((env::block_timestamp() / 1_000_000) - time_born + 300000) / 300000;

        if (fighting_times >= need_fighting_by_time_born) {

           panic!("Play too much in day!");
           
        } else {
            if(fighting_times_onday >= 3) {
                token_metadata.fighting_times_onday = Some(0);
                self.token_metadata_by_id.insert(&token_id, &token_metadata);
            };

            if ( (need_fighting_by_time_born - fighting_times) > 3 ) {
                fighting_times = need_fighting_by_time_born -3;
            } 
            let mut token_metadata = self.token_metadata_by_id.get(&token_id).expect("Not found token");
            let mut fighting_times_onday = token_metadata.fighting_times_onday.unwrap();
            fighting_times = fighting_times + 1;
            fighting_times_onday = fighting_times_onday + 1;
            last_time_fight = env::block_timestamp() / 1_000_000;
            exp = exp + 20;
            exp = exp + 20*lvl_dragon;
            power = u128::from(lvl_dragon) * 50 * u128::from(strike);
            blood = u128::from(lvl_dragon) * 320 * u128::from(strike);
            token_metadata.exp = Some(exp);
            token_metadata.blood = Some(blood);
            token_metadata.fighting_times = Some(fighting_times);
            token_metadata.power = Some(power);
            token_metadata.last_time_fight = Some(U64(last_time_fight));
            token_metadata.fighting_times_onday = Some(fighting_times_onday);



            // random ra thang thua
            let rdnum = env::block_timestamp() % 100;
            let percent = match rdnum {
                10..=15 => Some(1),
                26..=29 => Some(1),
                52..=57 => Some(1),
                81..=85 => Some(1),
                74..=77 => Some(1),
                _ => Some(0)
            };

            // when win
            if (percent == Some(1)) {
                let quality = token_metadata.quality.unwrap();
                let bonues = u128::from(lvl_dragon) * u128::from(quality);
                let amount = 6000000000000000000000000 + (6000000000000000000000000 * bonues / 100);
                // chuyen token cho user khi fighting xong 
                ext_ft_contract::ft_transfer(
                    token.owner_id,
                    U128(amount),
                    None,
                    &"16updragon-token.ngocduct.testnet",
                    1,
                    GAS_FOR_FT_TRANSFER
                );
                token_metadata.result_last_fight = Some(1);
                self.token_metadata_by_id.insert(&token_id, &token_metadata);
                return true;
            } else {
                //lose
                ext_ft_contract::ft_transfer(
                    token.owner_id,
                    U128(1000000000000000000000000/2),
                    None,
                    &"16updragon-token.ngocduct.testnet",
                    1,
                    GAS_FOR_FT_TRANSFER
                );
                token_metadata.result_last_fight = Some(0);
                self.token_metadata_by_id.insert(&token_id, &token_metadata);
                return false;
            }

        }
    }


    #[payable] 
    pub fn mating_dragon(&mut self, token_id_ma: &TokenId, token_id_fe: &TokenId, perpetual_royalties: Option<HashMap<AccountId, u32>>) {
        let before_storage_usage = env::storage_usage();

        let mut royalty = HashMap::new();

        // if perpetual royalties were passed into the function: 
        if let Some(perpetual_royalties) = perpetual_royalties {
            //make sure that the length of the perpetual royalties is below 7 since we won't have enough GAS to pay out that many people
            assert!(perpetual_royalties.len() < 7, "Cannot add more than 6 perpetual royalty amounts");

            //iterate through the perpetual royalties and insert the account and amount in the royalty map
            for (account, amount) in perpetual_royalties {
                royalty.insert(account, amount);
            }
        }



        let token_ma = self.tokens_by_id.get(&token_id_ma).expect("Not found token");
        let token_fe = self.tokens_by_id.get(&token_id_fe).expect("Not found token");
        let lvl_dragon_ma = self.get_lvl_dragon(&token_id_ma);
        let lvl_dragon_fe = self.get_lvl_dragon(&token_id_fe);
        let mut token_ma_metadata = self.token_metadata_by_id.get(&token_id_ma).expect("Not found token");
        let mut token_fe_metadata = self.token_metadata_by_id.get(&token_id_fe).expect("Not found token");
        
        let token = Token {
            owner_id: token_fe.owner_id.clone(),
            approved_account_ids: HashMap::default(),
            next_approval_id: 0,
            royalty
        };

        let token_id = u128::from(self.nft_total_supply()) + 1;
         
        assert!(
            self.tokens_by_id.insert(&U128(token_id), &token).is_none(),
            "Token already exsits"
        );
        
        assert!(&token_ma_metadata.live.unwrap(), "Male Dragon is dead");
        assert!(&token_fe_metadata.live.unwrap(), "FeMale Dragon is dead");

        assert_eq!(env::predecessor_account_id(), token_ma.owner_id.to_string(), "must be the owner of the dragon");
        assert_eq!(env::predecessor_account_id(), token_fe.owner_id.to_string(), "must be the owner of the dragon");

        assert_ne!(token_ma_metadata.sex, token_fe_metadata.sex, "cannot mate with the same sex");

        let child_gen = (token_fe_metadata.gen.unwrap() + token_ma_metadata.gen.unwrap())/2;
        let child_gen_generation = ( token_fe_metadata.generation.unwrap() + 1 + token_ma_metadata.generation.unwrap() + 1) /2;
        let child_gen_quality = (token_fe_metadata.quality.unwrap() + token_ma_metadata.quality.unwrap())/2;

        let rdnum = env::block_timestamp() % 100;
        let sex = match rdnum {
            10..=55 => Some(0),
            _ => Some(1)
        };

        let element: Option<u8> = match rdnum {
            25..=50 => Some(3),
            51..=75 => Some(2),
            75..=99 => Some(1),
            _ => Some(0)
        };

        let media: Option<String> = match element {
            Some(0) => Some("https://bafkreielrgolsam5c2mstan3xcs3hnmsfsl7umxd5iiiejh4bsoirsnyhe.ipfs.nftstorage.link/".to_owned()),
            Some(1) => Some("https://bafybeidmpa7htnijbzcmgcbs3feay42j7wpp33hb3ebtz6vl3t4kxawlpm.ipfs.nftstorage.link/".to_owned()),
            Some(2) => Some("https://bafybeievz56c3ngtxzm7qqf2izyu77szsr2ynfqyq5535sylqosgjgsr3a.ipfs.nftstorage.link/".to_owned()),
            _ => Some("https://bafybeie2owiv5nvzs42ptcoanq55icytyol6nqezmi6bqxnocbnpffyjxi.ipfs.nftstorage.link/".to_owned())
        };

        let metadata = TokenMetadata {
            title: None, 
            description: None, 
            media: media, 
            media_hash: None, 
            copies: None, 
            issued_at: None, 
            expires_at: None, 
            starts_at: None, 
            updated_at: None, 
            extra: None, 
            reference: None, 
            reference_hash: None,
            element,
            gen: Some(child_gen),
            generation: Some(child_gen_generation),
            quality: Some(child_gen_quality),
            exp: Some(0),
            power: Some(1),
            strike: Some(child_gen_quality),
            blood: Some(1),
            physical: Some(100),
            hunting: Some(child_gen_quality),
            sex,
            time_born: Some(U64(env::block_timestamp() / 1_000_000)),
            live: Some(true),
            feeding_times: Some(0),
            fighting_times: Some(0),
            fighting_times_onday: Some(0),
            last_time_fight: Some(U64(env::block_timestamp() / 1_000_000)),
            result_last_fight: Some(0)
        };

        self.token_metadata_by_id.insert(&U128(token_id), &metadata);

        // set token per owner
        self.internal_add_token_to_owner(&U128(token_id), &token.owner_id);

        // NFT MINT LOG
        let nft_mint_log: EventLog = EventLog {
            standard: "nep171".to_string(),
            version: "1.0.0".to_string(),
            event: EventLogVariant::NftMint(vec![ NftMintLog {
                owner_id: token.owner_id.to_string(),
                token_ids: vec![token_id.to_string()],
                memo: None
            } ])
        };
        env::log(&nft_mint_log.to_string().as_bytes());

        let after_storage_usage = env::storage_usage();
        // Refund near
        // refund_deposit(after_storage_usage - before_storage_usage);

        
    }

}

#[near_bindgen]
impl Contract {
    pub(crate) fn ft_process_purchase(&mut self, ft_contract_id: AccountId, price: U128, owner_nft: AccountId) -> PromiseOrValue<U128> {

        ext_self::ft_resolve_purchase(
            owner_nft, 
            price,
            ft_contract_id,
            &env::current_account_id(), 
            NO_DEPOSIT, 
            GAS_FOR_ROYALTIES
        ).into()
    }

    pub fn ft_resolve_purchase(&mut self, owner_nft: AccountId, price: U128, ft_contract_id: AccountId) -> U128 {

        ext_ft_contract::ft_transfer(
            owner_nft.clone(),
            price,
            None,
            &ft_contract_id,
            1,
            GAS_FOR_FT_TRANSFER
        );

        U128(0)
    }
}