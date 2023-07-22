import {
    BrowserRouter,
    Routes as Switch,
    Route,
    Navigate,
} from "react-router-dom";
import { appConfigs } from "../shared/configs/app";
import { HomePage } from "../pages/HomePage";

export function AppRoutes() {
    return (
        <BrowserRouter basename={appConfigs.WEB}>
            <Switch>
                <Route path={"/home"} element={<HomePage />} />
                <Route path="/*" element={<Navigate to={"/home"} />} />
            </Switch>
        </BrowserRouter>
    )
}