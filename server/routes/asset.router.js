const express = require("express")
const router = express.Router()

const assetsController = require("../controller/asset.controller")

router.get("/dashboard", assetsController.getAll)
router.post("/assets", assetsController.create)
router.post("/assetempdetails", assetsController.addAssetAndEmployee)
router.get("/tabledetails", assetsController.getData)
router.put("/editall/:id", assetsController.editAll)
router.get("/search", assetsController.globalSearch);
router.get("/searchAsset", assetsController.globalSearchAssets);
router.get("/paginateAsset", assetsController.paginateAssets);
router.get("/paginateDashboard", assetsController.paginateDashboard);
router.post("/checkpid", assetsController.productIdValidation)

module.exports = router
