Table of Contents
1.  [What are Carbon Credits for Cars](#what-are-carbon-credits-for-cars)
2.  [Getting Started](#getting-started)
3.  [How Carbon Credits for Cars Works](#how-carbon-credits-for-cars-works)
4.  [Next Steps](#next-steps)
5.  [Built With](#built-with)
6.  [Contact](#contact)

What are Carbon Credits for Cars
-----------------
_**Carbon Credits for Cars**_ At the intersection of stringent privacy laws and technological innovation, the automotive industry faces a timely opportunity. Many have embraced blockchain technology, often accentuating customer-centric applications to improve transparency and trust. Yet, an untapped reservoir lies dormant within a vehicle-centric approach - specifically, tokenizing Vehicle Identification Numbers (VINs) via a pivot in perspective.

By centering on vehicles, not customers, we construct a model that respects evolving privacy laws while unlocking substantive benefits. The ecosystem will gain trusted  insight into the vehicle's comprehensive carbon history, fostering informed purchases and enhancing safety. Dealers provide transparent service records, establishing trust with consumers and streamlining operations. Manufacturers glean granular insights into vehicle performance and longevity, securing and sharing valuable data that informs and transforms future production choices.

An innovative twist on the environmental, social, and governance (ESG) front, this vehicle-centric blockchain approach enables precise tracking of each vehicle's lifecycle impact. This capability could revolutionize the industry's approach to sustainability, empowering manufacturers with tools to quantify and curtail their vehicles' environmental footprint.

<img width="1191" alt="carbon website image v2" src="https://github.com/xrpl-carboncredit-5555/carbon4cars/assets/135251325/d397bfe7-a1c5-4678-bf91-b282f7a38e44">


View the prototype user interface web application here: [https://demos.d33gh5yazkl6vi.amplifyapp.com/]

Getting Started
---------------
The _**Carbon Credits for Cars**_ UI application has been deployed on AWS as a web service.  No
installation or configuration is required.  This web service application serves as a 
demo and is designed to be a 'sandbox' that can be used to demonstrate the functionality 
of Carbon Credits for Cars.  The UI web page will be displayed on a browser
formatted for a desktop for demonstration purposes. Ultimately the application will be deployed and formatted for mobile devices. 

*   Supported Browsers:
    *   Chrome
    *   Brave
    *   FireFox
    *   Edge

How Carbon Credits for Cars Works
--------------------
The project demo is built using React.js and consists of two primary UI elements initially: the **VIN Search screen**, 
and the **Purchase Carbon Credits screen**. https://youtu.be/7E8OB8-MAPw

**VIN Search screen--**
   This is the initial UI element and allows the user to enter a VIN (vehicle identification number) and search
   for information about that VIN.  Note: in this application, the user is restricted to a predefined list of
   VINs.  Ultimately, the user will enter their VIN and the search function will retrieve information from a
   publicly available API.
   
   *	Step 1 - Input Text Box. The user can enter/paste their VIN of interest.  All VINs are unique and require a specific format.
   	
   *	Step 2 - Search button.  If a valid VIN is entered, the search function will access the public VIN database via API and return specific information about that VIN to the UI form.
   	
   *	Step 3 - View Carbon Credits button.  Clicking this button will open the Purchase Carbon Credits screen.
   
**Purchase Carbon Credits screen--**
     This UI screen displays the total count of carbon credits that have been purchased for the selected VIN by one or multiple XRPL user accounts.  This screen also allows the user to purchase initial or additional carbon credits for the selected VIN.  Note: for demonstration purposes, a selection between two XRPL user accounts is provided.  In production, this would be replaced by connecting a wallet.

   *	Step 4 - Buy Carbon Credits button.  A user can select a purchaser account from the dropdown list and then select a quantity of carbon credits to purchase and apply to the selected VIN as tokens created specifically for this project.  A token has been issued on the XRP Ledger called 'CCC' with an initial count of 690000 tokens.

This token will represent carbon credits that have been purchased from selected carbon markets.
The Carbon Credits for Cars application will allow users to purchase these tokens and apply 
them to a specific VIN for the purpose of offsetting vehicle CO2 emissions.
   	
**VINs Minted as NFTs--**
  When carbon credits are initially purchased for a VIN, an NFT is created on the XRP Ledger that represents
the VIN as a unique asset.  The metadata associated with the NFT is stored in a Ceramic decentralized
database with the following JSON schema.  Notice the data for 2 VINs is shown.  Each VIN has a total token count representing
the total number of tokens purchased by one or multiple XRPL accounts.  For a VIN, 
each member of the credits array represents a purchase of ‘X’ number of tokens for a particular XRPL 
account (and the date purchased).  During the ‘purchase event’ in the UI application, this schema 
gets updated for the appropriate VIN and CCC tokens on XRPL are transferred from the issuer account 
to the purchaser account.
 
<img width="468" alt="image" src="https://github.com/xrpl-carboncredit-5555/carbon4cars/assets/135251325/96a3fb68-ca0b-4d85-977a-741c16602907">
 
 **AMM Trading Pair--**
   To allow users to easily trade their CCC tokens within the XRP Ledger, an AMM (Automated Market Maker)
function will be developed with CCC/XRP as trading pairs.  The AMM automatically regulates exchange rates between the two tokens, allowing for less volatile trading.  The 'Trade' button on the Purchase Carbon Credits screen will activate another UI screen that allows users to trade between the two tokens actively.
   
![amm](https://github.com/xrpl-carboncredit-5555/carbon4cars/assets/135251325/5e890e86-85b0-430e-a032-ffc302787a39)

Next Steps 
-------
Next steps and additional ways a VIN-centric NFT can add value to the automotive ecosystems with a focus on consumer, retailer, and manufacturer blockchain integrations:

1.	Provenance and Authenticity:
Consumers: Assures them of the vehicle's history, including ownership and maintenance records, for informed purchasing decisions.
Retailers: Enables them to guarantee the authenticity of the vehicles they sell.
Manufacturers: Allows for tracking of the vehicle throughout its lifecycle to maintain brand reputation.
	
2.	Secure and Immutable Record Keeping:
Consumers: Provides a tamper-proof record of their vehicle's history, beneficial for insurance and resale.
Retailers: Simplifies and secures record-keeping.
Manufacturers: Facilitates efficient recall processes and targeted maintenance services.

Built With
----------
*   [React](https://reactjs.org/) – JavaScript library for building user interfaces
*   [xrpl.js](https://xrpl.org/) - Javascript library for integrating dapps with the XRP Ledger,
*   XRP Ledger([https://testnet.xrpl.org](https://testnet.xrpl.org/) - testnet)
*   [Ceramic Network](https://ceramic.network/ :ceramic-clay testnet) - a decentralized data network for Web3 applications
*   [Node.js](https://nodejs.org/en/) - a cross-platform JavaScript runtime environment

Contact
-------
Jim Flint - [jim@localsearchgroup.com](mailto:jim@localsearchgroup.com)

LinkedIn - [https://www.linkedin.com/in/jimflint/]
