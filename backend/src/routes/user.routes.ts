import { Router } from "express";
import { createUser,AuthUser } from "../controllers/ctrlUser";

const router = Router();

router.post("/",createUser);
router.post("/auth",AuthUser);

export default router;