  /* eslint-disable */
import React, { useState } from 'react';
import theDefault, * as XRPL from 'xrpl';
import './InspectionForm.css';
import  vinLoad from '../vin_load.js';
import ClipLoader from "react-spinners/ClipLoader";
import { Buffer } from 'buffer';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { DataModel } from '@glazed/datamodel';
import { DIDDataStore } from '@glazed/did-datastore';
import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { getResolver } from 'key-did-resolver';

//the InspectionForm react component    
const InspectionForm = (props) => {
    const [loading, setLoading] = useState(false);  

    //******// INITIALIZE/CONNECT XRPL
    //const wallet = XRPL.Wallet.fromSeed("sEd7sNeSRqrLffzD7uBECUSqNtW9ARS");
    const client = new XRPL.Client("wss://s.altnet.rippletest.net:51233");
    //******//
  
    //******// INITIALIZE/CONNECT CERAMIC 
    //set up and authorize a DID (decentralized identifier)
    const privateKey = 'e89b10e72176dd6514470465c2ce3929b1ed55f40e0b3c8383098deb032dc1e7'
    const mySeed = Buffer.from(privateKey, 'hex');
      
    // Create and authenticate the DID specific to the privateKey
    const did = new DID({
        provider: new Ed25519Provider(mySeed), 
        resolver: getResolver(),
    })
    did.authenticate()
       
    //Connect to the Ceramic node - testnet
    const ceramic = new CeramicClient('https://ceramic-clay.3boxlabs.com')
    ceramic.did = did
     
    //set up datamodel
    const aliases = {
        "definitions": {
            "vinDefinition": "kjzl6cwe1jw1463usjeiknmufwgcboymdp2j9wrruwmy95y75u8bqkjalydao3d"
         },
         "schemas": {
            "vinSchema": "ceramic://k3y52l7qbv1frxof4wkm83k6zbpk8fibk8duptealpnextfnvgp0v045nedhih14w"
         },
        tiles: {},
    }
    const dataStore = new DIDDataStore({ ceramic, model: aliases });
    //******//

    let add = false;
    let selected = false;
    if (props.selected === true){selected = true};

    async function appendCeramicData(tokenObj) {
        let vinData = await dataStore.get('vinDefinition');
        let sumTokens= 0;
        for (var i = 0; i < vinData.vinArray.length; i++) {
            if (vinData.vinArray[i].vin === tokenObj.vin){
                await vinData.vinArray[i].properties.credits.push({
                    "cotokens": Number(tokenObj.cotokens),
                    "account": tokenObj.account,
                    "date": tokenObj.date,
                })
                
                for (var j = 0; j < vinData.vinArray[i].properties.credits.length; j++) {
                    sumTokens = sumTokens + vinData.vinArray[i].properties.credits[j].cotokens;
                } 
                vinData.vinArray[i].properties.totaltokens = sumTokens;
            }
        }

        await dataStore.set('vinDefinition', vinData)
        setLoading(false)  //stop progress spinner
        console.log('Data written to Ceramic database');
    } 

    async function setCeramicData(tokenObj) { 
        let vinArray = []
        let vinData = await dataStore.get('vinDefinition');
        let vinObj = {}
        
        vinObj = {
            "vin": tokenObj.vin,
            "properties": {
                "tokenid": tokenObj.tokenid,
                "totaltokens": Number(tokenObj.cotokens),
                "credits": [] 
            },
        }; 

        if (vinData === null){
               await vinObj.properties.credits.push({
                "cotokens": Number(tokenObj.cotokens),
                "account": tokenObj.account,
                "date": tokenObj.date,
            })
            vinArray.push(vinObj);

            await dataStore.set('vinDefinition', {vinArray});
        } else {
            //merge
            await vinObj.properties.credits.push({
                "cotokens": Number(tokenObj.cotokens),
                "account": tokenObj.account,
                "date": tokenObj.date,
            })
            vinArray.push(vinObj)
            for (var i = 0; i < vinData.vinArray.length; i++) {
                vinArray.push(vinData.vinArray[i])
            } 
            
            await dataStore.set('vinDefinition', {vinArray})  //pin:true
        }

        await updateCredits();  //write numbers to form
        setLoading(false)  //stop progress spinner
        console.log('Data written to Ceramic database');
        document.getElementById("submit").disabled = true;
    }
   
    async function createNFT(ceramicURI, theVIN, theSeed) { 
        await client.connect();
        console.log("Connected to XRPL test blockchain");
        const wallet =  XRPL.Wallet.fromSeed(theSeed);
        const txJSON = {
            TransactionType: "NFTokenMint",
            Account: wallet.classicAddress,
            NFTokenTaxon: 0,
            URI: Buffer.from(ceramicURI, 'utf8').toString('hex').toUpperCase(),
            Memos: [
                {
                Memo: {
                    MemoData: Buffer.from(JSON.stringify({
                        "vin": theVIN
                    }),
                    "utf8").toString("hex").toUpperCase()
                }
                }
            ],
        }
      
        const tx = await client.submitAndWait(txJSON, {wallet});

        console.log("NFT created");

        //get the tokenid of the new nft
        const nfts = await client.request({
        method: "account_nfts",
            account: wallet.classicAddress  
        })
        let tokenCount = 0;
        let myTokenID = '';
        for (var i = 0; i < nfts.result.account_nfts.length; i++) {
            if (nfts.result.account_nfts[i].nft_serial >= tokenCount){
                tokenCount = nfts.result.account_nfts[i].nft_serial;
                myTokenID = nfts.result.account_nfts[i].NFTokenID;
            }
        }
        return myTokenID
    }

    async function updateCredits(){
        let vinData = await dataStore.get('vinDefinition');
        let acct1Total = 0, acct2Total = 0;
        if (vinData != null){
            for (var i = 0; i < vinData.vinArray.length; i++) {
                if (vinData.vinArray[i].vin === document.getElementById("vin").value){ 
                    document.getElementById("totalcredits").value = vinData.vinArray[i].properties.totaltokens
                     for (var k = 0; k < vinData.vinArray[i].properties.credits.length; k++) {
                        //console.log(vinData.vinArray[i].properties.credits[k].cotokens)
                        //console.log(vinData.vinArray[i].properties.credits[k].account)
                        if (vinData.vinArray[i].properties.credits[k].account === "rQUq7JTX7ZCtx2Bj4fx3r2cWZT4yjGPEp2"){
                            acct1Total = acct1Total + vinData.vinArray[i].properties.credits[k].cotokens;
                        } else if (vinData.vinArray[i].properties.credits[k].account === "r4moDdXt7z4RCffX1B7p6LkxUohu155BxW"){
                            acct2Total = acct2Total + vinData.vinArray[i].properties.credits[k].cotokens;
                        }
                     }
                     document.getElementById("acct1").value = acct1Total;
                     document.getElementById("acct2").value = acct2Total; 
                }
            }
        } 
        //document.getElementById("acct1").value = acct1Total;
        //document.getElementById("acct2").value = acct2Total;      
    }

    //event handler for VIN form submit
    async function vinSubmit(event){
        event.stopPropagation();
        event.preventDefault();

        document.getElementById("creditsform").hidden = false;
        document.getElementById("submit2").disabled = true;
        document.getElementById("myvin").innerHTML = document.getElementById("vin").value;
        document.getElementById("credits").value = "1";
        document.getElementById("connect").selectedIndex = "-1";
        document.getElementById("trade").hidden = false;

        //set credit counts in second form
        document.getElementById("totalcredits").value = "0";
        document.getElementById("acct1").value = "0";
        document.getElementById("acct2").value = "0";
        await updateCredits();
    }
         
    async function creditsSubmit(event){
        event.stopPropagation();
        event.preventDefault();

        let vinData = await dataStore.get('vinDefinition');
//console.log(JSON.stringify(vinData, null, 2))
//return

        //let confirm = "Do you want to make this purchase?"
        //let isExecuted = window.confirm(confirm);
        //if (isExecuted === true){
            let aSeed = "";
            let myWallet;
            if (document.getElementById("connect").value.includes("rQUq7JTX7ZCtx2Bj4")){
                aSeed = "sEdSXGCUF2VTdVkpoKBLZKeKs3Tb993";
                myWallet =  XRPL.Wallet.fromSeed(aSeed);
            } else if (document.getElementById("connect").value.includes("r4moDdXt7z4RCffX1")){
                aSeed = "sEd7JKiHxV6WhsnRbRhS81ykN7ubAXg";
                myWallet =  XRPL.Wallet.fromSeed(aSeed);
            }

            const tokenData = {
                vin: document.getElementById("vin").value, 
                tokenid: 'x',
                date: setCurrentDate(),
                cotokens: document.getElementById("credits").value,
                account: myWallet.address
            };

            if (vinData === null){
                setLoading(true);  //start progress spinner
                let NFTdate = createNFT(aliases.schemas.vinSchema, document.getElementById("vin").value, aSeed)
                NFTdate.then(function(res) {
                    tokenData.tokenid = res;
                    setCeramicData(tokenData);
                    buyTokens(aSeed, document.getElementById("credits").value);
                })
            } else {
                let flag = 0;
                //if the VIN already exists, it's an append - not a new NFT
                for (var k = 0; k < vinData.vinArray.length; k++) {
                    if (vinData.vinArray[k].vin === document.getElementById("vin").value){
                        flag = 1;
                        //allow user to add more tokens (carbon credits) to the VIN
                        setLoading(true);
                        await appendCeramicData(tokenData); 
                        await buyTokens(aSeed, document.getElementById("credits").value)
                        await updateCredits() ;
                    }
                }

                //the VIN does not exist, so create new NFT
                if (flag === 0){
                    setLoading(true);  //start progress spinner
                    let NFTdate = createNFT(aliases.schemas.vinSchema, document.getElementById("vin").value, aSeed)
                    NFTdate.then(function(res) {
                        tokenData.tokenid = res;
                        setCeramicData(tokenData);
                        buyTokens(aSeed, document.getElementById("credits").value);
                    }) 
                }                        
            } 
       //} else {return;}
    }

    function setCurrentDate() { 
        let current_datetime = new Date()
        let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds() 
        return formatted_date;
    }

    async function setTrustLine(){
        await client.connect();
        const receiver_wallet = XRPL.Wallet.fromSeed("sEd7JKiHxV6WhsnRbRhS81ykN7ubAXg");
        const issuer_wallet = XRPL.Wallet.fromSeed("sEdSARfR7aSwyvBLUSLyYH6uT1WjgyB");

        // Create trust line from receiver to issuer address --------------------------------
        const trust_set_tx = {
          "TransactionType": "TrustSet",
          "Account": receiver_wallet.address,
          "LimitAmount": {
            "currency": "CCC",
            "issuer": issuer_wallet.address,
            "value": "1000000" 
          }
        }
  
        const ts_prepared = await client.autofill(trust_set_tx)
        const ts_signed = receiver_wallet.sign(ts_prepared)
        console.log("Creating trust line from hot address to issuer...")
        const ts_result = await client.submitAndWait(ts_signed.tx_blob)
        if (ts_result.result.meta.TransactionResult == "tesSUCCESS") {
          console.log("Transaction succeeded")
        } else {
          throw `Error sending transaction: ${ts_result.result.meta.TransactionResult}`
        }  
    } 

    async function buyTokens(tokenReceiver, amount){
        // Get credentials from the Testnet Faucet 
        await client.connect();
        const receiver_wallet = XRPL.Wallet.fromSeed(tokenReceiver);  
        const issuer_wallet = XRPL.Wallet.fromSeed("sEdSARfR7aSwyvBLUSLyYH6uT1WjgyB");
        //console.log(`Got hot address ${receiver_wallet.address} and cold address ${issuer_wallet.address}.`)

        // Send token 
        const issue_quantity = amount;
        const currency_code = "CCC";
        const send_token_tx = {
            "TransactionType": "Payment",
            "Account": issuer_wallet.address,
            "Amount": {
            "currency": currency_code,
                "value": issue_quantity,
                "issuer": issuer_wallet.address
            },
            "Destination": receiver_wallet.address,
            "DestinationTag": 1 // Needed since we enabled Require Destination Tags on the hot account earlier.
        }

        const pay_prepared = await client.autofill(send_token_tx)
        const pay_signed = issuer_wallet.sign(pay_prepared)
        console.log(`Sending ${issue_quantity} ${currency_code} to ${receiver_wallet.address}...`)
        const pay_result = await client.submitAndWait(pay_signed.tx_blob)
        if (pay_result.result.meta.TransactionResult == "tesSUCCESS") {
            console.log("Transaction succeeded")
        } else {
            throw `Error sending transaction: ${pay_result.result.meta.TransactionResult}`
        }

        //console.log the results
        let account = receiver_wallet.address
        const responseLines = await client.request({
            command: "account_lines",
            account: account,
            ledger_index: "validated",
        })

        console.log(`\nAccount ${account}'s Trust lines:`)
        for (let i = 0 ; i < responseLines.result.lines.length; i++) {
            console.log(`\n${i+1}. Trustline:`)
            console.log(` - Account: ${responseLines.result.lines[i].account}`)
            console.log(` - Currency: ${responseLines.result.lines[i].currency}`)
            console.log(` - Amount: ${responseLines.result.lines[i].balance}`)
            console.log(` - Limit: ${responseLines.result.lines[i].limit}`)
            console.log(` - Limit Peer: ${responseLines.result.lines[i].limit_peer}`)
        }
    }

    function decodeVIN(){
        for (var k = 0; k < vinLoad.loader.length; k++) {
            if (vinLoad.loader[k].vin === document.getElementById("vin").value){
                document.getElementById("make").value = vinLoad.loader[k].properties.make;
                document.getElementById("model").value = vinLoad.loader[k].properties.model;
                document.getElementById("year").value = vinLoad.loader[k].properties.year;
                document.getElementById("drivetype").value = vinLoad.loader[k].properties.drivetype;
                document.getElementById("stylebody").value = vinLoad.loader[k].properties.style;
                document.getElementById("engine").value = vinLoad.loader[k].properties.engine;
                document.getElementById("manufactured").value = vinLoad.loader[k].properties.mfg;
                document.getElementById("age").value = vinLoad.loader[k].properties.age;
            }
        }
        document.getElementById("submit").disabled = false;
        //setTrustLine()
    }

    function changeVIN(){
        document.getElementById("make").value = "";
        document.getElementById("model").value = "";
        document.getElementById("year").value = "";
        document.getElementById("drivetype").value = "";
        document.getElementById("stylebody").value = "";
        document.getElementById("engine").value = "";
        document.getElementById("manufactured").value = "";
        document.getElementById("age").value = "";
        document.getElementById("submit").disabled = true;
        document.getElementById("creditsform").hidden = true;
        document.getElementById("ammform").hidden = true;
        document.getElementById("trade").hidden = true;
    }

    function getAcct(){
        document.getElementById("submit2").disabled = false;
    }

    function ammTrade(){
        document.getElementById("ammform").hidden = false;
        document.getElementById("label1").innerHTML = "{";
        document.getElementById("label2").innerHTML = `"Account" : "rJVUeRqDFNs2xqA7ncVE6ZoAhPUoaJJSQm",`;
        document.getElementById("label3").innerHTML = `"Amount" : {`;
        document.getElementById("label4").innerHTML = `"currency" : "CCC",`
        document.getElementById("label5").innerHTML = `"issuer" : "rP9jPyP5kyvFRb6ZiRghAGw5u8SGAmU4bd",`
        document.getElementById("label6").innerHTML = `"value" : "25"`
        document.getElementById("label7").innerHTML = `},`
        document.getElementById("label8").innerHTML = `"Amount2" : "250000000",`
        document.getElementById("label9").innerHTML = `"Fee" : "10",`
        document.getElementById("label10").innerHTML = `"Flags" : 2147483648,`
        document.getElementById("label11").innerHTML = `"Sequence" : 6,`
        document.getElementById("label12").innerHTML = `"TradingFee" : 500,`
        document.getElementById("label13").innerHTML = `"TransactionType" : "AMMCreate"`
        document.getElementById("label14").innerHTML = `}`
    }

    function closeAMM(){
        document.getElementById("ammform").hidden = true;
        document.getElementById("creditsform").hidden = false;
    }

    return ( 
    <>
    <div>
        <button id="search" onClick={decodeVIN}>Search</button> 
        <button id="trade" onClick={ammTrade} hidden>Trade</button>
    </div>
    <form className="vinform" id="vinformid" onSubmit={vinSubmit}> 
        <div>
            <label style={{ position: "relative", top: "14px", width: "300px", right: "26px", fontWeight: "bold" }}>Select Vehicle Identification Number</label>
            <select id="vin" onChange={changeVIN} style={{ position: "relative", width: "170px", height: "25px", right: "25px", top: "18px", color: "blue", fontsize: "17px", fontweight: "bold" }}>
                <option value="1GTEK19RXVE536195">1GTEK19RXVE536195</option>
                <option value="1C4NJPBA1CD661292">1C4NJPBA1CD661292</option>
                <option value="3FAFP08Z66R143414">3FAFP08Z66R143414</option>
                <option value="1P3BP36D3HF192068">1P3BP36D3HF192068</option>
                <option value="1HD1FAL11NY500561">1HD1FAL11NY500561</option>
                <option value="JH4KA4630LC007479">JH4KA4630LC007479</option>
            </select>
        </div>
        <div>
            <label style={{ position: "relative", top: "43px", width: "135px", right: "100px", fontweight: "bold" }}>Make:</label>
            <input type="text" id="make" style={{ position: "relative", background: "lightblue", width: "175px", height: "25px", right: "-45px", top: "20px", color: "blue", fontsize: "17px", fontweight: "bold" }} readOnly></input>
        </div>
        <div>
            <label style={{ position: "relative", top: "30px", width: "135px", right: "97px", fontweight: "bold" }}>Model:</label>
            <input type="text" id="model" style={{ position: "relative", background: "lightblue", width: "175px", height: "25px", right: "-45px", top: "8px", color: "blue", fontsize: "17px", fontweight: "bold" }} readOnly></input>
        </div>
        <div>
            <label style={{ position: "relative", top: "17px", width: "135px", right: "104px", fontweight: "bold" }}>Year:</label>
            <input type="text" id="year" style={{ position: "relative", background: "lightblue", width: "175px", height: "25px", right: "-45px", top: "-5px", color: "blue", fontsize: "17px", fontweight: "bold" }} readOnly></input>
        </div>
        <div>
            <label style={{ position: "relative", top: "4px", width: "135px", right: "85px", fontweight: "bold" }}>Drive Type:</label>
            <input type="text" id="drivetype" style={{ position: "relative", background: "lightblue", width: "175px", height: "25px", right: "-45px", top: "-18px", color: "blue", fontsize: "17px", fontweight: "bold" }} readOnly></input>
        </div>
        <div>
            <label style={{ position: "relative", top: "-9px", width: "135px", right: "84px", fontweight: "bold" }}>Style/Body:</label>
            <input type="text" id="stylebody" style={{ position: "relative", background: "lightblue", width: "175px", height: "25px", right: "-45px", top: "-31px", color: "blue", fontsize: "17px", fontweight: "bold" }} readOnly></input>
        </div>
        <div>
            <label style={{ position: "relative", top: "-22px", width: "135px", right: "96px", fontweight: "bold" }}>Engine:</label>
            <input type="text" id="engine" style={{ position: "relative", background: "lightblue", width: "175px", height: "25px", right: "-45px", top: "-44px", color: "blue", fontsize: "17px", fontweight: "bold" }} readOnly></input>
        </div>
        <div>
            <label style={{ position: "relative", top: "-35px", width: "135px", right: "102px", fontweight: "bold" }}>Mfg.:</label>
            <input type="text" id="manufactured" style={{ position: "relative", background: "lightblue", width: "175px", height: "25px", right: "-45px", top: "-56px", color: "blue", fontsize: "17px", fontweight: "bold" }} readOnly></input>
        </div>
        <div>
            <label style={{ position: "relative", top: "-48px", width: "135px", right: "105px", fontweight: "bold" }}>Age:</label>
            <input type="text" id="age" style={{ position: "relative", background: "lightblue", width: "175px", height: "25px", right: "-45px", top: "-69px", color: "blue", fontsize: "17px", fontweight: "bold" }} readOnly></input>
        </div>
        <div>
            <button type="submit" id="submit" disabled>View Carbon Credits</button>
        </div>
    </form>
    <form className="creditsform" id="creditsform" onSubmit={creditsSubmit} hidden> 
        <div>
            <button type="submit2" id="submit2" disabled>Buy</button>
        </div>
        <div>
            <label style={{ position: "relative", top: "-12px", width: "135px", right: "110px", fontweight: "bold" }}>VIN:</label>
            <label id="myvin" style={{ position: "relative", top: "-39px", width: "135px", right: "24px", color: "blue", fontweight: "bold", fontSize: 22, fontFamily: "serif"}}>vin</label>
        </div>
        <div>
            <label style={{ position: "relative", top: "-28px", width: "235px", right: "8px", fontweight: "bold" }}>Total Carbon Credits</label>
            
            <input type="text" id="totalcredits" style={{ position: "relative", width: "70px", height: "30px", right: "6px", top: "-20px", color: "blue", fontSize: "30px", fontWeight: "bold" }}></input>
            <p style={{ position: "relative", right: "20px", top: "8px" }}>acct#<span>&nbsp;</span><span style={{fontSize: "13px", color: "darkgreen", fontFamily: "Verdana"}}> rQUq7JTX7ZCtx2Bj4...</span> </p>
            <p style={{ position: "relative", right: "18px", top: "3px" }}>acct#<span>&nbsp;</span><span style={{fontSize: "13px", color: "darkgreen", fontFamily: "Verdana"}}> r4moDdXt7z4RCffX1...</span> </p> 
            <input type="text" id="acct1" autoComplete="off" style={{ position: "relative", width: "40px", height: "25px", right: "-124px", top: "-70px", color: "blue", fontsize: "17px", fontweight: "bold" }}></input> 
            <input type="text" id="acct2" autoComplete="off" style={{ position: "relative", width: "40px", height: "25px", right: "-84px", top: "-36px", color: "blue", fontsize: "17px", fontweight: "bold" }}></input> 
        </div>
        <div>
            <select id="connect" onChange={getAcct} style={{ position: "relative", width: "158px", height: "25px", right: "-15px", top: "38px", color: "green", fontSize: "12px", fontWeight: "bold" }}>
                <option value="rQUq7JTX7ZCtx2Bj4...">rQUq7JTX7ZCtx2Bj4...</option>
                <option value="r4moDdXt7z4RCffX1...">r4moDdXt7z4RCffX1...</option>
            </select>
            <label style={{ position: "relative", top: "-50px", width: "35px", right: "187px", fontSize: "43px", fontWeight: "bold" }}>______________</label>
            <label style={{ position: "relative", top: "-45px", width: "175px", right: "2px", fontWeight: "bold" }}>Purchase Carbon Credits</label>
            <label style={{ position: "relative", top: "-40px", width: "175px", right: "-26px" }}>Select an XRPL account</label>
            <label style={{ position: "relative", top: "28px", width: "60px", right: "137px" }}>Quantity:</label>
            <input type="text" id="credits" autoComplete="off" style={{ position: "relative", width: "50px", height: "25px", right: "-11px", top: "5px", color: "blue", fontsize: "17px", fontweight: "bold" }}></input>
        </div> 
        <ClipLoader
        color={'red'}
        loading={loading}
        cssOverride={{ position: "absolute", left: "180px", bottom: "14px", borderColor: "red"}}
        size={30}
        />  
    </form>
    <form className="ammform" id="ammform"  hidden>
        <label style={{ position: "relative", top: "5px", width: "305px", right: "2px", fontWeight: "bold" }}>AMM for CCC/XRP Trading Pair</label>
        <label id="label1" style={{position: "relative", width: "340px", height: "25px", fontSize: "12px", right: "178px", top: "6px"}}></label>
        <label id="label2" style={{position: "relative", width: "340px", height: "25px", fontSize: "12px", right: "22px", top: "-6px"}}></label>
        <label id="label3" style={{position: "relative", width: "340px", height: "25px", fontSize: "12px", right: "140px", top: "-18px"}}></label>
        <label id="label4" style={{position: "relative", width: "340px", height: "25px", fontSize: "12px", right: "100px", top: "-30px"}}></label>
        <label id="label5" style={{position: "relative", width: "340px", height: "25px", fontSize: "12px", right: "5px", top: "-42px"}}></label>
        <label id="label6" style={{position: "relative", width: "340px", height: "25px", fontSize: "12px", right: "114px", top: "-54px"}}></label>
        <label id="label7" style={{position: "relative", width: "340px", height: "25px", fontSize: "12px", right: "164px", top: "-66px"}}></label>
        <label id="label8" style={{position: "relative", width: "340px", height: "25px", fontSize: "12px", right: "100px", top: "-78px"}}>,</label>
        <label id="label9" style={{position: "relative", width: "340px", height: "25px", fontSize: "12px", right: "138px", top: "-90px"}}></label>
        <label id="label10" style={{position: "relative", width: "340px", height: "25px", fontSize: "12px", right: "112px", top: "-102px"}}></label>
        <label id="label11" style={{position: "relative", width: "340px", height: "25px", fontSize: "12px", right: "128px", top: "-114px"}}></label>
        <label id="label12" style={{position: "relative", width: "340px", height: "25px", fontSize: "12px", right: "118px", top: "-126px"}}></label>
        <label id="label13" style={{position: "relative", width: "340px", height: "25px", fontSize: "12px", right: "78px", top: "-138px"}}></label>
        <label id="label14" style={{position: "relative", width: "340px", height: "25px", fontSize: "12px", right: "176px", top: "-150px"}}></label>
        <div style={{position: "relative", right: "9px", top: "-145px"}}>
        <textarea id="descAMM" readonly="true" name="AMM" rows="8" cols="54">To allow users to easily trade their CCC tokens within the XRP Ledger, an AMM (Automated Market Maker) function will be developed with CCC/XRP as trading pairs. Exchange rates between the two tokens is automatically regulated by the AMM allowing for less volatile trading.  This UI screen will have tools that allow user to easily trading between the two tokens.</textarea>
        </div>
        
    </form>
    </>
  );
} 
export default InspectionForm;



