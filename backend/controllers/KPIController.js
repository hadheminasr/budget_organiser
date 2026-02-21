import {KPI} from "../service/index.js"
/*export const getVueGlobale = async (req, res) => {
  try {
    const data = await KPI.VueGlobale();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
export const getActiviteComportement = async (req, res) => {
  try {
    const data = await KPI.activiteComportement();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }


};*/
export const getKPI = async (req,res)=>{
  const data = await KPI.all();
  return res.json({success:true, data});
}

