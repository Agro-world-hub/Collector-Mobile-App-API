const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middlewares/auth.middleware');	
const TargetEP = require('../end-point/TargetNew-ep');

// GET daily targets for specific officer
router.get('/officer',authMiddleware, TargetEP.getTargetForOfficerManagerView);
router.get('/officer/:officerId',TargetEP.getDailyTargetsForOfficer);

//get targets for center
router.get("/get-center-target",authMiddleware,TargetEP.getCenterTarget)

//pass and recieve targets

router.put('/pass-target',TargetEP.transferTarget);
router.put('/recieve-target',TargetEP.receiveTarget);

router.put('/manager/pass-target',authMiddleware,TargetEP.ManagertransferTarget);
router.put('/manager/recieve-target',authMiddleware,TargetEP.ManagereceiveTarget);

//get daily todo by variety

router.get('/get-daily-todo-byvariety/:officerId/:varietyId/:grade',TargetEP.getDailyTarget);

//officer summary and percentage
router.get("/officer-task-summary", authMiddleware, TargetEP.getOfficerTaskSummary);
router.get("/officer-task-summary/:collectionOfficerId", TargetEP.getOfficerTaskSummaryManagerView);




module.exports = router;