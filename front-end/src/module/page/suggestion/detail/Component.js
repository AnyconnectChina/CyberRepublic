import React from 'react';
import _ from 'lodash'
import { Row, Col, Spin, Button, Modal } from 'antd'
import MediaQuery from 'react-responsive'
import Comments from '@/module/common/comments/Container'
import Footer from '@/module/layout/Footer/Container'
import BackLink from "@/module/shared/BackLink/Component"
import Translation from '@/module/common/Translation/Container'
import SuggestionForm from '@/module/form/SuggestionForm/Container'
import I18N from '@/I18N'
import { LG_WIDTH } from '@/config/constant'
import StandardPage from '../../StandardPage'
import ActionsContainer from '../common/actions/Container'
import MetaContainer from '../common/meta/Container'
import MySuggestion from '../my_list/Container'

import { Container, Title, Desc, StyledLink, BtnGroup, StyledButton } from './style'

export default class extends StandardPage {
  constructor(props) {
    super(props)

    // we use the props from the redux store if its retained
    this.state = {
      isDropdownActionOpen: false,
      showMobile: false,
      showForm: false,
    }
  }

  componentDidMount() {
    super.componentDidMount()
    this.refetch(true)
  }

  componentWillUnmount() {
    this.props.resetDetail()
  }

  ord_renderContent() {
    if (_.isEmpty(this.props.detail) || this.props.detail.loading) {
      return <div className="center"><Spin size="large" /></div>
    }
    const detailNode = this.renderDetail()
    const translationBtn = this.renderTranslationBtn()
    const actionsNode = this.renderActionsNode()
    const ownerActionsNode = this.renderOwnerActionsNode()
    const councilActionsNode = this.renderCouncilActionsNode()
    const editForm = this.renderEditForm()
    const mySuggestionNode = <MySuggestion />
    const commentNode = this.renderCommentNode()
    return (
      <div>
        <Container>
          <MediaQuery maxWidth={LG_WIDTH}>
            <div><BackLink link="/suggestion" style={{ position: 'relative', left: 0, marginBottom: 15 }} /></div>
            <div>
              {detailNode}
              {translationBtn}
              {actionsNode}
              {ownerActionsNode}
              {councilActionsNode}
            </div>
            <div>{mySuggestionNode}</div>
            <div>{commentNode}</div>
          </MediaQuery>
          <MediaQuery minWidth={LG_WIDTH + 1}>
            <BackLink link="/suggestion" />
            <Row gutter={24}>
              <Col span={15}>
                {detailNode}
                {translationBtn}
                {actionsNode}
                {ownerActionsNode}
                {councilActionsNode}
                {commentNode}
              </Col>
              <Col span={9}>{mySuggestionNode}</Col>
            </Row>
          </MediaQuery>
          {editForm}
        </Container>
        <Footer />
      </div>
    )
  }

  renderDetail() {
    const metaNode = this.renderMetaNode()
    const titleNode = this.renderTitleNode()
    const descNode = this.renderDescNode()
    const linkNode = this.renderLinkNode()
    return (
      <div>
        {metaNode}
        {titleNode}
        {descNode}
        {linkNode}
      </div>
    )
  }

  renderMetaNode() {
    const { detail } = this.props
    return <MetaContainer data={detail} />
  }

  renderActionsNode() {
    const { detail } = this.props
    return <ActionsContainer data={detail} />
  }

  renderOwnerActionsNode() {
    const { detail, currentUserId } = this.props
    const isOwner = currentUserId === _.get(detail, 'createdBy._id')
    const res = isOwner && (
      <StyledButton type="ebp" className="cr-btn cr-btn-default" onClick={this.showEditForm}>
        {I18N.get('suggestion.btnText.edit')}
      </StyledButton>
    )
    return res
  }

  renderCouncilActionsNode() {
    const { detail, consider, needMoreInfo, makeIntoProposal, isCouncil } = this.props
    const res = isCouncil && (
      <BtnGroup>
        <Row type="flex" justify="flex-start">
          <Col xs={24} sm={8}>
            <StyledButton type="ebp" className="cr-btn cr-btn-default" onClick={consider}>
              {I18N.get('suggestion.btnText.consider')}
            </StyledButton>
          </Col>
          <Col xs={24} sm={8}>
            <StyledButton type="ebp" className="cr-btn cr-btn-default" onClick={needMoreInfo}>
              {I18N.get('suggestion.btnText.needMoreInfo')}
            </StyledButton>
          </Col>
          <Col xs={24} sm={8}>
            <StyledButton type="ebp" className="cr-btn cr-btn-primary" onClick={makeIntoProposal}>
              {I18N.get('suggestion.btnText.makeIntoProposal')}
            </StyledButton>
          </Col>
        </Row>
      </BtnGroup>
    )
    return res
  }

  renderTitleNode() {
    const { detail } = this.props
    return (
      <Title>{detail.title}</Title>
    )
  }

  renderDescNode() {
    const { detail } = this.props
    return (
      <Desc dangerouslySetInnerHTML={{ __html: detail.desc }} />
    )
  }

  renderLinkNode() {
    const { detail } = this.props

    if (!detail.link) {
      return null
    }

    return (
      <StyledLink>
        {I18N.get('from.TaskCreateForm.label.info')}: <a href={detail.link} target="_blank">{detail.link}</a>
      </StyledLink>
    )
  }

  renderTranslationBtn() {
    const { title, desc } = this.props.detail
    const text = `<h1>${title}</h1>${desc}`

    return (
      <div style={{ marginTop: 20 }}>
        <Translation text={text} />
      </div>
    )
  }

  renderCommentNode() {
    const { detail } = this.props
    return (
      <Comments
        type="suggestion"
        suggestion={detail}
        canPost
        model={detail._id}
        returnUrl={`/suggestion/${detail._id}`}
      />
    )
  }

  renderEditForm() {
    return (
      <Modal
        className="project-detail-nobar"
        visible={this.state.showForm}
        onOk={this.showEditForm}
        onCancel={this.showEditForm}
        footer={null}
        width="70%"
      >
        { this.state.showForm
          && <SuggestionForm showEditForm={this.showEditForm} refetch={this.refetch} />
        }
      </Modal>
    )
  }

  showEditForm = () => {
    const { showForm } = this.state

    this.setState({
      showForm: !showForm,
    })
  }

  showDropdownActions = () => {
    const { isDropdownActionOpen } = this.state
    this.setState({
      isDropdownActionOpen: !isDropdownActionOpen,
    })
  }

  refetch = async (incViewsNum) => {
    const id = _.get(this.props, 'match.params.id')
    await this.props.resetDetail()
    this.props.getDetail({ id, incViewsNum: !!incViewsNum })
  }

  linkSuggestionDetail(suggestionId) {
    this.props.history.push(`/suggestion/${suggestionId}`)
  }
}
