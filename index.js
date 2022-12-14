const mongoose = require('mongoose');
const profile = require('./models/profile');
const shop = require('./models/guildShop');
const guildProfile = require('./models/guildProfile');
const inventory = require('./models/inventory');
let mongoUrl;

if (process.version.slice(1, 3) - 0 < 16) {
    throw new Error(
        `NodeJS Version 16 or newer is required, but you are using ${process.version}. See https://nodejs.org to update or use your distros package manager.`,
    );
}

class DcEco {

    /**
     * 
     * @param {string} dbUrl
     * @preserve
     */
    static async setMongoURL(dbUrl) {
        if (!dbUrl) throw new TypeError('A MongoDB database URL is required.');

        mongoUrl = dbUrl;
        return mongoose.connect(dbUrl);
    }

    /**
     * 
     * @param {string} userID
     * @preserve
     * @returns User
     */
    static async createProfile(userID) {
        if (!userID) throw new TypeError("An user ID was not provided!");

        const isUser = await profile.findOne({ userID });
        if (isUser) return false;

        const user = new profile({
            userID
        });

        await user.save().catch(e => console.log(`Failed to create user! \nError: ${e}`));

        return user;
    }

    /**
     * 
     * @param {string} userID
     * @preserve
     * @returns 
     */
    static async deleteProfile(userID) {
        if (!userID) throw new TypeError("An user ID was not provided!");

        const user = await profile.findOne({ userID });
        if (!user) return false;

        await profile.findOneAndDelete({ userID }).catch(e => console.log(`Failed to delete user! \nError: ${e}`));

        return user;
    }

    /**
     * 
     * @param {string} userID
     * @param {number} wb
     * @preserve
     * @returns 
     */
    static async addWalletBal(userID, wb) {
        if (!userID) throw new TypeError("An userID was not provided but is required!");
        if (wb === 0 || !wb || isNaN(parseInt(wb))) throw new TypeError("Amount to add to balance was not provided or invalid!");

        const user = await profile.findOne({ userID });

        if (!user) {
            const newUser = new profile({
                userID,
                wallet: wb,
            });

            await newUser.save().catch(e => console.log("Failed to save new user with given balance!"));

            return newUser;
        }

        user.wallet += parseInt(wb, 10);
        user.lastUpdated = new Date();

        await user.save().catch(e => console.log(`Failed to add wallet balance! \nError: ${e}`));

        return user;
    }

    /**
     * 
     * @param {string} userID
     * @param {number} bb
     * @preserve
     * @returns 
     */
    static async addBankBal(userID, bb) {
        if (!userID) throw new TypeError("An userID was not provided but is required!");
        if (bb === 0 || !bb || isNaN(parseInt(bb))) throw new TypeError("Amount to add to balance was not provided or invalid!");

        const user = await profile.findOne({ userID });

        if (!user) {
            const newUser = new profile({
                userID,
                bank: bb,
            });

            await newUser.save().catch(e => console.log("Failed to save new user with given balance!"));

            return newUser;
        }

        user.bank += bb;
        user.lastUpdated = new Date();

        await user.save().catch(e => console.log(`Failed to add bank balance! \nError: ${e}`));

        return user;
    }

    /**
     * 
     * @param {string} userID
     * @param {number} bb
     * @preserve
     * @returns 
     */
    static async setBankBal(userID, bb) {
        if (!userID) throw new TypeError("An userID was not provided but is required!");
        if (bb === 0 || !bb || isNaN(parseInt(bb))) throw new TypeError("Amount to set as balance was not provided or invalid!");

        const user = await profile.findOne({ userID });
        if (!user) return false;

        user.bank = bb;
        user.lastUpdated = new Date();

        await user.save().catch(e => console.log(`Failed to set bank balance! \nError: ${e}`));

        return user;
    }

    /**
     * 
     * @param {string} userID
     * @param {number} wb
     * @preserve
     * @returns
     */
    static async setWalletBal(userID, wb) {
        if (!userID) throw new TypeError("An userID was not provided but is required");
        if (wb === 0 || !wb || isNaN(parseInt(wb))) throw new TypeError("Amount to set as balance was not provided or is invalid");

        const user = await profile.findOne({ userID });
        if (!user) return false;

        user.wallet = wb;
        user.lastUpdated = new Date();

        await user.save().catch(e => console.log(`Failed to set wallet balance! \nError: ${e}`));

        return user;
    }

    /**
     * 
     * @param {string} userID 
     * @param {number} wb 
     * @preserve
     * @returns 
     */
    static async subtractWalletBal(userID, wb) {
        if (!userID) throw new TypeError("An userID was not provided but is required");
        if (wb === 0 || !wb || isNaN(parseInt(wb))) throw new TypeError("Amount to subtract from balance was not provided or is invalid");

        const user = await profile.findOne({ userID });
        if (!user) return false;

        user.wallet -= wb;
        user.lastUpdated = new Date();

        await user.save().catch(e => console.log(`Failed to subtract from wallet balance! \nError: ${e}`));

        return user;
    }

    /**
     * 
     * @param {string} userID 
     * @param {number} bb 
     * @preserve
     * @returns 
     */
    static async subtractBankBal(userID, bb) {
        if (!userID) throw new TypeError("An userID was not provided but is required");
        if (bb === 0 || !bb || isNaN(parseInt(bb))) throw new TypeError("Amount to subtract from balance was not provided or is invalid");

        const user = await profile.findOne({ userID });
        if (!user) return false;

        user.bank -= bb;
        user.lastUpdated = new Date();

        await user.save().catch(e => console.log(`Failed to subtract from bank balance! \nError: ${e}`));

        return user;
    }

    /**
     * 
     * @param {string} userID
     * @returns
     * @preserve
     */
    static async fetch(userID) {
        if (!userID) throw new TypeError("An userID was not provided but is required!");

        const user = await profile.findOne({ userID });
        if (!user) return false;

        return user;
    }

    /**
     * 
     * @param {string} guildID
     * @param {string} name
     * @param {string} type
     * @param {number} price
     * @param {*} meta
     * @preserve
     * @returns
     */
    static async createShopItem(guildID, name, type, price, meta) {
        if(!guildID || !name || !price || price == "0" || isNaN(parseInt(price)) || !type || !meta) throw new TypeError("A required argument has not been provided!");

        const guildEntry = await shop.findOne({ guildID });
        const isShopItem = await shop.findOne({
            guildID,
            shopItems: {
                $elemMatch: {
                    name: name,
                },
            },
        });

        if(!guildEntry) {
            const newEntry = new shop({
                guildID,
                shopItems: { name: name, type: type, price: price, meta: meta},
            });

            await newEntry.save().catch(e => console.log(`Failed to create new entry! \nError: ${e}`));

            return newEntry;
        }

        if(guildEntry && isShopItem) return false;
        if(guildEntry && !isShopItem) {
            guildEntry.shopItems.push({name: name, type: type, price: price, meta: meta});
            await guildEntry.save().catch(e => console.log(`Failed to create new entry! \nError: ${e}`));

            return guildEntry;
        }
    }

    /**
     * 
     * @param {string} guildID 
     * @param {string} name 
     * @preserve
     * @returns 
     */
    static async deleteShopItem(guildID, name) {
        if(!guildID) throw new TypeError("A guildID is required but has not been provided!");
        if(!name) throw new TypeError("The item name is required but hasn't been provided!");

        const isShopItem = await shop.findOne({
            guildID,
            shopItems: {
                $elemMatch: {
                    name: name,
                },
            },
        });
        if(!isShopItem) return false;

        const filteredItems = isShopItem.shopItems.filter(item => item.name !== name);

        isShopItem.shopItems = filteredItems;
        isShopItem.lastUpdated = new Date();

        await isShopItem.save().catch(e => console.log(`Failed to delete entry! \nError: ${e}`));

        return isShopItem;
    }

    /**
     * 
     * @param {string} guildID 
     * @param {string} name 
     * @preserve
     * @returns 
     */
    static async fetchShopItem(guildID, name) {
        if(!guildID) throw new TypeError("A guildID is required but has not been provided!");
        if(!name) throw new TypeError("The item name is required but hasn't been provided!");

        const isShopItem = await shop.findOne({
            guildID,
            shopItems: {
                $elemMatch: {
                    name: name,
                },
            },
        });
        if(!isShopItem) return false;

        const filteredItems = isShopItem.shopItems.filter(item => item.name === name);

        return filteredItems[0];
    }

    /**
     * 
     * @param {string} guildID 
     * @preserve
     * @returns 
     */
    static async deleteGuildShop(guildID) {
        if(!guildID) throw new TypeError("A guildID is required but has not been provided!");

        const isShop = await shop.findOne({ guildID });
        if(!isShop) return false;

        const deleted = await shop.findOneAndDelete({ guildID }).catch(e => console.log(`Deleting entry failed! \nError: ${e}`));

        return deleted;
    }

    /**
     * 
     * @param {*} guildID 
     * @preserve
     * @returns 
     */
    static async fetchShopItems(guildID) {
        if(!guildID) throw new TypeError("A guildID is required but has not been provided!");

        const GshopItems = await shop.findOne({ guildID }).catch(e => console.log(`Fetching shop items failed! \nError: ${e}`));

        if(GshopItems.shopItems.length <= 0) return false;
        return GshopItems.shopItems;
    }

    /**
     * 
     * @param {number} amnt 
     * @param {number} tax 
     * @preserve
     * @returns 
     */
    static async taxCalc(amnt, tax) {
        if(!amnt || amnt === 0 || isNaN(parseInt(amnt)) || amnt < 0) throw new TypeError("Amount wasn't provided or is invalid");
        if(!tax || tax === 0 || isNaN(parseInt(tax)) || tax > 60 || tax < 0) throw new TypeError("Tax wasn't provided or invalid");

        let taxNoPercentage = Math.floor(tax / 100);

        let taxedAmount = (amnt - (Math.floor(amnt * taxNoPercentage)));
        let taxIncome = amnt - taxedAmount
        let returnData = { taxedTotal: taxedAmount, taxIncome: taxIncome };

        return returnData;
    }

    /**
     * 
     * @param {number} amnt 
     * @param {number} tax 
     * @param {string} ownerID 
     * @preserve
     * @returns 
     */
    static async tax(amnt, tax, ownerID) {
        if(!amnt || amnt === 0 || isNaN(parseInt(amnt)) || amnt < 0) throw new TypeError("Amount wasn't provided or is invalid");
        if(!tax || tax === 0 || isNaN(parseInt(tax)) || tax > 60 || tax < 0) throw new TypeError("Tax wasn't provided or invalid");
        if(!ownerID) throw new TypeError("The bot owner ID was not provided!");

        let taxNoPercentage = Math.floor(tax / 100);

        let taxedAmount = (amnt - (Math.floor(amnt * taxNoPercentage)));
        let taxIncome = amnt - taxedAmount

        const user = await profile.findOne({ userID: ownerID });

        if (!user) {
            const newUser = new profile({
                userID: ownerID,
                bank: taxIncome,
            });

            await newUser.save().catch(e => console.log("Failed to save new user with given balance!"));
        }

        user.bank += taxIncome;
        user.lastUpdated = new Date();

        await user.save().catch(e => console.log(`Failed to add bank balance! \nError: ${e}`));
        return taxedAmount;
    }

    /**
     * 
     * @param {string} guildID 
     * @returns 
     */
    static async createGuildProfile(guildID) {
        if(!guildID) throw new TypeError("A guildID is required but has not been provided!");

        const isGuild = await guildProfile.findOne({ guildID });
        if(isGuild) return false;

        const newGuild = new guildProfile({
            guildID
        });

        await newGuild.save().catch(e => console.log("Failed to save new guild profile!"));

        return newGuild;
    }

    /**
     * 
     * @param {string} guildID 
     * @param {number} bal 
     * @preserve
     * @returns 
     */
    static async addGuildBalance(guildID, bal) {
        if(!guildID) throw new TypeError("A guildID is required but has not been provided!");
        if(!bal || bal === 0 || isNaN(parseInt(bal)) || bal < 0) throw new TypeError("The amount wasn't provided or is invalid");

        const guild = await guildProfile.findOne({ guildID });
        if(!guild) {
            const newGuild = new guildProfile({
                guildID,
                bank: bal,
            });

            await newGuild.save().catch(e => console.log(`Failed to save new guild with given balance! \nError: ${e}`));
            return newGuild;
        }

        guild.bank += bal;
        guild.lastUpdated = new Date();

        await guild.save().catch(e => console.log(`Failed to add bank balance to guild! \nError: ${e}`));
        return guild;
    }

    /**
     * 
     * @param {string} guildID 
     * @param {number} bal 
     * @preserve
     * @returns 
     */
    static async setGuildBalance(guildID, bal) {
        if(!guildID) throw new TypeError("A guildID is required but has not been provided!");
        if(!bal || bal === 0 || isNaN(parseInt(bal)) || bal < 0) throw new TypeError("The amount wasn't provided or is invalid");

        const guild = await guildProfile.findOne({ guildID });
        if(!guild) {
            const newGuild = new guildProfile({
                guildID,
                bank: bal,
            });

            await newGuild.save().catch(e => console.log(`Failed to save new guild with given balance! \nError: ${e}`));
            return newGuild;
        }

        guild.bank = bal;
        guild.lastUpdated = new Date();

        await guild.save().catch(e => console.log(`Failed to set bank balance for guild! \nError: ${e}`));
        return guild;
    }

    /**
     * 
     * @param {string} guildID 
     * @param {number} bal 
     * @preserve
     * @returns 
     */
    static async subtractGuildBalance(guildID, bal) {
        if(!guildID) throw new TypeError("A guildID is required but has not been provided!");
        if(!bal || bal === 0 || isNaN(parseInt(bal)) || bal < 0) throw new TypeError("The amount wasn't provided or is invalid");

        const guild = await guildProfile.findOne({ guildID });
        if(!guild) throw new TypeError("The guild doesn't exist!");

        guild.bank -= bal;
        guild.lastUpdated = new Date();

        await guild.save().catch(e => console.log(`Failed to subtract bank balance from guild! \nError: ${e}`));
        return guild;
    }

    /**
     * 
     * @param {string} guildID 
     * @returns 
     */
    static async fetchGuildProfile(guildID) {
        if(!guildID) throw new TypeError("A guildID is required but has not been provided!");

        const guild = await guildProfile.findOne({ guildID });
        if(!guild) return false;

        return guild;
    }

    /**
     * 
     * @param {string} guildID
     * @preserve 
     * @returns 
     */
    static async deleteGuildProfile(guildID) {
        if(!guildID) throw new TypeError("A guildID is required but has not been provided!");

        const isGuild = await guildProfile.findOne({ guildID });
        if(!isGuild) return false;

        const deleted = await guildProfile.findOneAndDelete({ guildID }).catch(e => console.log(`Deleting entry failed! \nError: ${e}`));

        return deleted;
    }

    /**
     * 
     * @param {string} guildID 
     * @param {string} userID 
     * @returns 
     */
    static async createInventory(guildID, userID) {
        if(!guildID) throw new TypeError("A guildID is required but hasn't been provided!");
        if(!userID) throw new TypeError("A userID is required but has not been provided!");

        const isInv = await inventory.findOne({ guildID, userID });
        if(isInv) return false;

        const newInv = new inventory({
            userID,
            guildID,
        })

        await newInv.save().catch(e => console.log(`Failed to save user inventory! \nError: ${e}`));

        return newInv;
    }

    /**
     * 
     * @param {string} guildID 
     * @param {string} userID 
     * @param {Object} item 
     * @preserve
     * @returns 
     */
    static async pushToInventory(guildID, userID, item) {
        if(!guildID) throw new TypeError("A guildID is required but has not been provided!");
        if(!userID) throw new TypeError("A userID is required but has not been provided!");
        if(!item) throw new TypeError("An item is required but has not been provided!");
        if(!item.name) throw new TypeError("Item must have a name.");

        const userINV = await inventory.findOne({ userID, guildID });
        if(!userINV) {
            const newINV = new inventory({
                userID,
                guildID,
                inventory: [item],
            });

            await newINV.save().catch(e => console.log(`Failed to save new inventory! \nError: ${e}`));
            return newINV;
        }

        userINV.inventory.push(item);
        userINV.lastUpdated = new Date();

        await userINV.save().catch(e => console.log(`Failed to add item to inventory! \nError: ${e}`));
        return userINV;
    }

    /**
     * 
     * @param {string} guildID 
     * @param {string} userID 
     * @param {Object} item 
     * @preserve
     * @returns 
     */
    static async removeFromInventory(guildID, userID, item) {
        if(!guildID) throw new TypeError("A guildID is required but has not been provided!");
        if(!userID) throw new TypeError("A userID is required but has not been provided!");
        if(!item) throw new TypeError("An item is required but has not been provided!");
        if(!item.name) throw new TypeError("Item must have a name.");

        const userINV = await inventory.findOne({ userID, guildID });
        if(!userINV) return false;

        const itemIndex = userINV.inventory.findIndex(i => i.name === item.name);
        if(itemIndex === -1) return false;
        userINV.inventory.splice(itemIndex, 1);
        userINV.lastUpdated = new Date();

        await userINV.save().catch(e => console.log(`Failed to remove item from inventory! \nError: ${e}`));
        return userINV;
    }

    /**
     * 
     * @param {string} guildID 
     * @param {string} userID 
     * @param {Object} item 
     * @preserve
     * @returns 
     */
    static async fetchFromInventory(guildID, userID, item) {
        if(!guildID) throw new TypeError("A guildID is required but has not been provided!");
        if(!userID) throw new TypeError("A userID is required but has not been provided!");
        if(!item) throw new TypeError("An item is required but has not been provided!");
        if(!item.name) throw new TypeError("Item must have a name.");

        const userINV = await inventory.findOne({ userID, guildID });
        if(!userINV) return false;

        const itemIndex = userINV.inventory.findIndex(i => i.name === item.name);
        if(itemIndex === -1) return false;

        return userINV.inventory[itemIndex];
    }

    /**
     * 
     * @param {string} guildID 
     * @param {string} userID 
     * @preserve
     * @returns 
     */
    static async fetchInventory(guildID, userID) {
        if(!guildID) throw new TypeError("A guildID is required but has not been provided!");
        if(!userID) throw new TypeError("A userID is required but has not been provided!");

        const userINV = await inventory.findOne({ userID, guildID });
        if(!userINV) return false;

        return userINV;
    }

    static async deleteInventory(guildID, userID) {
        if(!guildID) throw new TypeError("A guildID is required but has not been provided!");
        if(!userID) throw new TypeError("A userID is required but has not been provided!");

        const isInv = await inventory.findOne({ userID, guildID });
        if(!isInv) return false;

        const deleted = await inventory.findOneAndDelete({ userID, guildID }).catch(e => console.log(`Deleting entry failed! \nError: ${e}`));

        return deleted
    }
}


module.exports = DcEco;