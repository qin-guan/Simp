import * as React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import Home from "../pages/app/Home";
import Classroom from "../pages/app/Classroom";
import Lesson from "../pages/app/Lesson";
import ClassroomDashboard from "../pages/app/ClassroomDashboard";
import ClassroomSettings from "../pages/app/ClassroomSettings";
import Assignment from "../pages/app/Assignment";

const WebAppRoutes = (): React.ReactElement => {
    const match = useRouteMatch();
    return (
        <Switch>
            <Route exact path={`${match.path}/`} component={Home}/>
            <Route exact path={`${match.path}/classrooms/:classroomId`} component={Classroom}/>
            <Route exact path={`${match.path}/classrooms/:classroomId/dashboard`} component={ClassroomDashboard}/>
            <Route exact path={`${match.path}/classrooms/:classroomId/settings`} component={ClassroomSettings}/>
            <Route exact path={`${match.path}/classrooms/:classroomId/lessons/:lessonId`} component={Lesson}/>
            <Route path={`${match.path}/classrooms/:classroomId/lessons/:lessonId/assignments/:assignmentId`} component={Assignment}/>
        </Switch>
    );
};

export default WebAppRoutes;