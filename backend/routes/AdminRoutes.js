import express from "express";
import { depenseVsRevenuTimeline,depensesParCategorieBar,donutRepartitionCategories,paretoTopCategories,financierCategories ,funnelComptes,top10ComptesParActivite7j,histogramCategoriesParCompte,ActiviteComportement,heatmapJourHeure7j,depensesVsRevenus7j,top5CategoriesDepenses7j,operationsParJour7j,AddOperation,AddCathegorie,VueGlobal, AddObjectif,getObjectifStats,getNbComptesPartage,getNbComptesActive,getNbComptesInactive,getComptes,getNbUsers,getNbUsersActive,getNbUsersInactive,getAllComptes,getAllUsers,getUser,updateUser,deleteUser,AddUser,getCompte,updateCompte,deleteCompte, AddCompte }  from "../controllers/AdminController.js";
const router = express.Router();
//routes des users
router.get("/users",getAllUsers);
router.get("/user/:id",getUser);
router.put("/user/:id",updateUser);
router.delete("/user/:id",deleteUser);
router.post("/user",AddUser);
router.get("/nb-users",getNbUsers);
router.get("/nb-users-active",getNbUsersActive);
router.get("/nb-users-inactive",getNbUsersInactive);
//route de vue globale
//kpi's vue globale
router.get("/vue-globale",VueGlobal);
//graphes vue globale 
//operationsParJour7j
router.get("/vue-globale/OperationParJour",operationsParJour7j);
//top5CategoriesDepenses7j
router.get("/vue-globale/top5CategoriesDepenses",top5CategoriesDepenses7j)
//depensesVsRevenus7j
router.get("/vue-globale/depensesVsRevenus",depensesVsRevenus7j);
//heatmapJourHeure7j
router.get("/vue-globale/heatmapJourHeure7j",heatmapJourHeure7j);

//routes de Activite & comportement
//kpi's Activite & comportement
router.get("/ActiviteComportement",ActiviteComportement);
//graphes Activite & comportement
//top10ComptesParActivite7j
router.get("/ActiviteComportement/histogramCategoriesParCompte",histogramCategoriesParCompte);
//top10ComptesParActivite7j
router.get ("/ActiviteComportement/top10ComptesParActivite7j",top10ComptesParActivite7j);
//funnelComptes
router.get("/ActiviteComportement/funnelComptes",funnelComptes);

//routes de financierCategories
//kpi's financierCategories 
router.get ("/financierCategories",financierCategories );
//graphes de 
//paretoTopCategories
router.get("/financierCategories/paretoTopCategories",paretoTopCategories);
//donutRepartitionCategories
router.get("/financierCategories/donutRepartitionCategories",donutRepartitionCategories);
//depensesParCategorieBar
router.get("/financierCategories/depensesParCategorieBar",depensesParCategorieBar)
//depenseVsRevenuTimeline
router.get("/financierCategories/depenseVsRevenuTimeline",depenseVsRevenuTimeline)
//routes des comptes
router.get("/comptes",getAllComptes);
router.get("/compte/:id",getCompte);
router.put("/compte/:id",updateCompte);
router.delete("/compte/:id",deleteCompte);
router.post("/compte",AddCompte);
router.get("/nb-comptes-active",getNbComptesActive);
router.get("/nb-comptes-inactive",getNbComptesInactive);    
router.get ("/nb-comptes",getComptes);
router.get("/nb-comptes-partage",getNbComptesPartage);


//routes des objectifs
router.get("/objectif-stats",getObjectifStats);
router.post("/objectif",AddObjectif);


//routes des cathegorie
router.post("/cathegorie",AddCathegorie)


//routes des operations
router.post("/operation",AddOperation);

export default router;