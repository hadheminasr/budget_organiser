/*import { adminService } from "../service/AdminService.js";







export const VueGlobal = async (req,res)=>{
    try{
        console.log("test1");
        const vue_globale=await adminService.VueGlobale();
        console.log(VueGlobal);
        return res .status(200).json({sucess:true,vue_globale});
    }catch(error){
        console.error("Error in VueGlobal", error);
        return res.status(500).json({ sucess: false, message: "server error" });    
    }

};


export const operationsParJour7j=async (req,res)=>{
    try{
        const operationsParJour7j = await adminService.operationsParJour7j()
        res.status(200).json({sucess:true,message: "voici operationsParJour7j stats" ,operationsParJour7j})


    }catch(error){
        res.status(400).json({sucess:false,message:error.message})

    }
};
export const top5CategoriesDepenses7j=async (req,res)=>{
    try{
        const top5CategoriesDepenses7j = await adminService.top5CategoriesDepenses7j()
        res.status(200).json({sucess:true,message: "voici top5CategoriesDepenses7j stats" ,top5CategoriesDepenses7j})


    }catch(error){
        res.status(400).json({sucess:false,message:error.message})

    }
}
export const depensesVsRevenus7j=async (req,res)=>{
    try{
        const depensesVsRevenus7j = await adminService.depensesVsRevenus7j()
        res.status(200).json({sucess:true,message: "voici depensesVsRevenus7j stats" ,depensesVsRevenus7j})


    }catch(error){
        res.status(400).json({sucess:false,message:error.message})

    }
}
export const heatmapJourHeure7j=async (req,res)=>{
    try{
        const heatmapJourHeure7j = await adminService.heatmapJourHeure7j()
        res.status(200).json({sucess:true,message: "voici heatmapJourHeure7j stats" ,heatmapJourHeure7j})


    }catch(error){
        res.status(400).json({sucess:false,message:error.message})

    }
};
export const ActiviteComportement = async (req, res) => {
  try {
    const stats = await adminService.ActiviteComportement();
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error comptesActifsVsSemainePassee:", error);
    return res.status(500).json({ success: false, message: "server error" });
  }
};
 export const histogramCategoriesParCompte = async (req, res) => {
  try {
    const stats = await adminService.histogramCategoriesParCompte();
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error histogramCategoriesParCompte:", error);
    return res.status(500).json({ success: false, message: "server error" });
  }
};
export const top10ComptesParActivite7j = async (req, res) => {
  try {
    const stats = await adminService.top10ComptesParActivite7j();
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error top10ComptesParActivite7j:", error);
    return res.status(500).json({ success: false, message: "server error" });
  }
};
export const funnelComptes = async (req, res) => {
  try {
    const stats = await adminService.funnelComptes();
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error funnelComptes:", error);
    return res.status(500).json({ success: false, message: "server error" });
  }
};
export const financierCategories = async (req, res) => {
  try {
    const stats = await adminService.financierCategories();
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error financierCategories", error);
    return res.status(500).json({ success: false, message: "server error" });
  }
};
export const paretoTopCategories = async (req, res) => {
  try {
    const stats = await adminService.paretoTopCategories();
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error paretoTopCategories", error);
    return res.status(500).json({ success: false, message: "server error" });
  }
};
export const donutRepartitionCategories = async (req, res) => {
  try {
    const stats = await adminService.donutRepartitionCategories();
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error donutRepartitionCategories", error);
    return res.status(500).json({ success: false, message: "server error" });
  }
};
export const depensesParCategorieBar = async (req, res) => {
  try {
    const stats = await adminService.depensesParCategorieBar();
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error depensesParCategorieBar", error);
    return res.status(500).json({ success: false, message: "server error" });
  }
};
export const depenseVsRevenuTimeline = async (req, res) => {
  try {
    const stats = await adminService.depenseVsRevenuTimeline();
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error depenseVsRevenuTimeline", error);
    return res.status(500).json({ success: false, message: "server error" });
  }
};
*/




 