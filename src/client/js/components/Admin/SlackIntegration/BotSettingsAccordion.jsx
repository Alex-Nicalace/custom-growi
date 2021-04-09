import React from 'react';
import { Collapse } from 'reactstrap';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const Group = ({ children }) => (
  <div className="card border-0 rounded-lg mb-0">{ children }</div>
)

const Header = ({ children }) => (
  const { t } = useTranslation();
  <div
    className="card-header font-weight-normal py-3 d-flex justify-content-between"
    role="button"
    onClick={() => onToggleAccordionHandler(0)}
  >
    <p className="mb-0 text-primary"><span className="mr-2">①</span>{t('slack_integration.without_proxy.create_bot')}</p>
    {currentlyOpenAccordionIndexes.includes(0)
      ? <i className="fa fa-chevron-up" />
      : <i className="fa fa-chevron-down" />
    }
  </div>
)

const Body = ({ children }) => (
  <Collapse isOpen={currentlyOpenAccordionIndexes.includes(0)}>
    <div className="card-body">
      { children }
    </div>
  </Collapse>
)

const BotSettingsAccordion = ({ children, currentlyOpenAccordionIndexes }) => {


  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden">
      { children }
    </div>
  )

}

BotSettingsAccordion.Group = Group;
BotSettingsAccordion.Header = Header;
BotSettingsAccordion.Body = Body;

Group.propTypes = {
  children: PropTypes.element,
}

Header.propTypes = {
  children: PropTypes.element,
}

Body.propTypes = {
  children: PropTypes.element,
}

BotSettingsAccordion.propTypes = {
  children: PropTypes.element,
  currentlyOpenAccordionIndexes: PropTypes.object,
}

export default BotSettingsAccordion;
