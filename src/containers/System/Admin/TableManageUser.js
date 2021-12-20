import React, { Component } from 'react';
import { connect } from 'react-redux';
import './TableManageUser.scss'
import * as actions from '../../../store/actions'

import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
// import style manually
import 'react-markdown-editor-lite/lib/index.css';

// Register plugins if required
// MdEditor.use(YOUR_PLUGINS_HERE);

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

// Finish!
function handleEditorChange({ html, text }) {
    console.log('handleEditorChange', html, text);
}

class TableManageUser extends Component {

    constructor(props) {
        super(props)
        this.state = {
            usersRedux: [],
        }
    }

    componentDidMount() {
        this.props.fetchUserRedux()//goi redux
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.listUsers !== this.props.listUsers) {//update state sau khi them va xoa
            this.setState({
                usersRedux: this.props.listUsers
            })
        }
    }

    deleteUser = (data) => {
        this.props.deleteUser(data.id)
    }

    handleEditUser = (data) => {
        this.props.handleEditUserFromParent(data) //truyen state tu con sang cha 
    }

    render() {
        let arrUser = this.state.usersRedux
        return (

            <React.Fragment>
                <table id="TableManageUser">
                    <tbody>
                        <tr>
                            <th>Email</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Address</th>
                            <th>Action</th>
                        </tr>
                        {arrUser && arrUser.length > 0 &&
                            arrUser.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{item.email}</td>
                                        <td>{item.firstName}</td>
                                        <td>{item.lastName}</td>
                                        <td>{item.address}</td>
                                        <td>
                                            <button className='btn-edit' onClick={() => this.handleEditUser(item)}><i className="fas fa-pen-square"></i></button>
                                            <button className='btn-delete' onClick={() => this.deleteUser(item)} ><i className="fas fa-trash-alt"></i></button>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>

                <MdEditor style={{ height: '500px' }} renderHTML={text => mdParser.render(text)} onChange={handleEditorChange} />

            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        listUsers: state.admin.users,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchUserRedux: () => dispatch(actions.fetchAllUsersStart()),//fire action
        deleteUser: (data) => dispatch(actions.deleteUser(data)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableManageUser);
