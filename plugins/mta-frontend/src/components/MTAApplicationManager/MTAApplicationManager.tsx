import React, { useState } from 'react';
import { Grid, Tab, Tabs, makeStyles } from '@material-ui/core';
import { LinkButton, ResponseErrorPanel } from '@backstage/core-components';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { AppCard } from '../AppCard/AppCard';
import { AnalysisPage } from '../AnalysisPage/AnalysisPage';
import { Application } from '../../api/api';
import { ApplicationDetailsHeader } from './ApplicationDetailsHeader';
import { useApi } from '@backstage/core-plugin-api';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1, // Ensures the container takes full height
    width: '100%', // Ensures the container takes full width
  },
  tabPanel: {
    display: 'block', // Ensures the tab panel is always visible when selected
    width: '100%', // Ensures the tab panel takes full width
    minHeight: 500, // Adjust this value based on your content needs
    flex: '1 0 auto', // Prevents flex items from shrinking
  },
  tabBar: {
    borderBottom: '1px solid ' + theme.palette.divider,
    marginBottom: theme.spacing(2),
  },
}));

export const MTAApplicationManager = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const catalogApi = useApi(catalogApiRef);
  const initialApplication = entity.metadata
    .application as unknown as Application;

  const [application, setApplication] =
    useState<Application>(initialApplication);
  const [isWaiting, setIsWaiting] = React.useState(false);
  console.log('application', application);

  React.useEffect(() => {
    if (entity) {
      // Initially load the application data based on the entity
      catalogApi
        .getEntityByRef(
          `${entity.kind.toLowerCase()}:${
            entity.metadata.namespace || 'default'
          }/${entity.metadata.name}`,
        )
        .then(appEntity => {
          setApplication(
            appEntity?.metadata.application as unknown as Application,
          );
        })
        .catch(error => console.error('Failed to load entity', error));
    }
  }, []);

  const [tab, setTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  if (!entity) {
    return (
      <ResponseErrorPanel
        title="No entity context available"
        error={
          new Error('This component must be used within an entity context.')
        }
      />
    );
  }

  return (
    <Grid container direction="column" className={classes.root}>
      <ApplicationDetailsHeader
        application={application}
        setApplication={setApplication}
        isWaiting={isWaiting}
        setIsWaiting={setIsWaiting}
      />
      <Grid item xs={12} className={classes.tabBar}>
        <Tabs
          variant="fullWidth"
          value={tab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          aria-label="application tabs"
        >
          <Tab label="Application Details" />
          <Tab label="Analysis" />
        </Tabs>
        {tab === 0 && <AppCard />}
        {tab === 1 && <AnalysisPage />}
      </Grid>
      {/* {tab === 0 && (
        <Grid item xs={12} className={classes.tabPanel} role="tabpanel">
          <AppCard />
        </Grid>
      )}
      {tab === 1 && (
        <Grid item xs={12} className={classes.tabPanel} role="tabpanel">
          <AnalysisPage />
        </Grid>
      )} */}
      {/* <Grid item xs={12} key={tab}></Grid> */}
    </Grid>
  );
};

export default MTAApplicationManager;
