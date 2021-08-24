const HouseModel = require('../models/House');
const User = require('../models/User')

async function getTopHouses(){
    const houses = await HouseModel.find({}).sort({createdAt: -1}).limit(3).lean();
    return houses;
}

async function getAllHouses(){
    const houses = await HouseModel.find({}).lean();
    return houses;
}

async function getHouseById(id){
    const house = await HouseModel.findById(id).populate('rentedBy').lean();
    return house;
}

async function createHouse(houseData){
    const house = new HouseModel(houseData);
    await house.save();
    return house;
}

async function editHouse(id, houseData){
    const house = await HouseModel.findById(id);

    house.name = houseData.name;
    house.type = houseData.type;
    house.year = houseData.year;
    house.city = houseData.city;
    house.description = houseData.description;
    house.piecesAvailable = houseData.piecesAvailable;

    return house.save()
}

async function deleteHouse(id) {
    return HouseModel.findByIdAndDelete(id)
}

async function rentHouse(id, userId){
    const house = await HouseModel.findById(id);

    house.piecesAvailable -= 1;

    house.rentedBy.push(userId)
    return house.save()
}

async function searchHouse(query){
    const pattern = new RegExp(`^${query}$`, 'i')
    const match = await HouseModel.find({type: {$regex: pattern}}).lean();
    return match;
}

module.exports = {
    createHouse,
    getTopHouses,
    getHouseById,
    editHouse,
    deleteHouse,
    getAllHouses,
    rentHouse,
    searchHouse
}