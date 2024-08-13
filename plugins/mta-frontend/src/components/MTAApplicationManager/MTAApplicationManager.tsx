import React from 'react';
import { Grid, Tab, Tabs, makeStyles } from '@material-ui/core';
import { LinkButton, ResponseErrorPanel } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { AppCard } from '../AppCard/AppCard';
import { AnalysisPage } from '../AnalysisPage/AnalysisPage';
import { Application } from '../../api/api';
import { ApplicationDetailsHeader } from './ApplicationDetailsHeader';

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
  const entity = useEntity();
  const application = entity?.entity?.metadata
    .application as unknown as Application;
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
      <ApplicationDetailsHeader application={application} />
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
