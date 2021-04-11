import * as React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import Home from "../pages/app/Home";
import Classroom from "../pages/app/Classroom";
import Lesson from "../pages/app/Lesson";

const WebAppRoutes = (): React.ReactElement => {
    const match = useRouteMatch();
    return (
        <Switch>
            <Route exact path={`${match.path}/`} component={Home}/>
            <Route exact path={`${match.path}/classrooms/:classroomId`} component={Classroom}/>
            <Route path={`${match.path}/classrooms/:classroomId/lessons/:lessonId`} component={Lesson}/>
        </Switch>
    );
};

export default WebAppRoutes;