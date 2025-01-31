import { Router } from "express";
import {createEvent,deleteEvent,getAllEvents,updateEvent} from "../controllers/ctrlEvent"
import {authenticateToken} from "../middleware/middlewareAuth"

const router = Router();

router.post("/",authenticateToken,createEvent);
router.get("/",authenticateToken,getAllEvents);
router.put("/:id",updateEvent)
router.delete("/:id",deleteEvent);

export default router;