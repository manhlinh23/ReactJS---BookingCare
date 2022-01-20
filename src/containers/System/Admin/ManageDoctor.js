import React, { Component } from 'react';
import { connect } from 'react-redux';
import './ManageDoctor.scss'
import * as actions from '../../../store/actions'
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import Select from 'react-select';
import { CRUD_ACTIONS, LANGUAGES } from '../../../utils';
import { getDetailDoctor } from '../../../services/userService'
import { FormattedMessage } from 'react-intl';


const mdParser = new MarkdownIt(/* Markdown-it options */);

class ManageDoctor extends Component {

    constructor(props) {
        super(props)
        this.state = {

            // save to Markdown table
            contentHtml: '',
            contentMarkDown: '',
            selectedOption: '',
            desc: '',
            hasOldData: false,


            // save to doctor_infor table
            listDoctors: [],
            listPrice: [],
            listPayment: [],
            listProvince: [],
            listSpecialty: [],
            listClinic: [],


            selectedPrice: '',
            selectedPayment: '',
            selectedProvince: '',
            selectedSpecialty: '',
            selectedClinic: '',


            nameClinic: '',
            addressClinic: '',
            note: '',
        }
    }

    componentDidMount() {
        this.props.fetchAllDoctors()
        this.props.fetchRequiredDoctorInfo()
    }


    builtDataInputSelect = (data, type) => {
        let result = []
        let { language } = this.props
        if (data && data.length > 0) {
            if (type === 'USERS') {
                data.map((item, index) => {
                    let object = {}
                    let labelEn = `${item.lastName} ${item.firstName}`
                    let labelVi = `${item.firstName} ${item.lastName}`

                    object.label = language === LANGUAGES.EN ? labelEn : labelVi
                    object.id = item.id

                    result.push(object)
                })
            }
            if (
                type === 'PRICE'
            ) {
                data.map((item, index) => {
                    let object = {}
                    let labelEn = `${item.valueEn} USD`
                    let labelVi = `${item.valueVi} VNĐ`

                    object.label = language === LANGUAGES.EN ? labelEn : labelVi
                    object.id = item.keyMap

                    result.push(object)
                })
            }
            if (
                type === 'PAYMENT' ||
                type === 'PROVINCE'
            ) {
                data.map((item, index) => {
                    let object = {}
                    let labelEn = `${item.valueEn}`
                    let labelVi = `${item.valueVi}`

                    object.label = language === LANGUAGES.EN ? labelEn : labelVi
                    object.id = item.keyMap

                    result.push(object)
                })
            }

            if (type === 'SPECIALTY') {
                data.map((item, index) => {
                    let object = {}
                    object.label = item.name
                    object.id = item.id

                    result.push(object)
                })
            }
            if (type === 'CLINIC') {
                data.map((item, index) => {
                    let object = {}
                    object.label = item.name
                    object.id = item.id

                    result.push(object)
                })
            }
            return result
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.listDoctorsRedux !== this.props.listDoctorsRedux ||
            prevProps.language !== this.props.language) {
            let dataSelect = this.builtDataInputSelect(this.props.listDoctorsRedux, 'USERS')
            this.setState({
                listDoctors: dataSelect
            })
        }

        if (prevProps.allRequiredDoctorInfo !== this.props.allRequiredDoctorInfo || prevProps.language !== this.props.language) {
            let { resPayment, resProvince, resPrice, resSpecialty, resClinic } = this.props.allRequiredDoctorInfo
            let dataSelectresPayment = this.builtDataInputSelect(resPayment, 'PAYMENT')
            let dataSelectresProvince = this.builtDataInputSelect(resProvince, 'PROVINCE')
            let dataSelectresPrice = this.builtDataInputSelect(resPrice, 'PRICE')
            let dataSelectresSpecialty = this.builtDataInputSelect(resSpecialty, 'SPECIALTY')
            let dataSelectresClinic = this.builtDataInputSelect(resClinic, 'CLINIC')

            // console.log('>>> update  ', dataSelectresPayment, dataSelectresProvince, dataSelectresPrice);
            this.setState({
                listPrice: dataSelectresPrice,
                listProvince: dataSelectresProvince,
                listPayment: dataSelectresPayment,
                listSpecialty: dataSelectresSpecialty,
                listClinic: dataSelectresClinic
            })


        }



        // if (prevProps.language !== this.props.language) {
        //     let dataSelect = this.builtDataInputSelect(this.props.listDoctorsRedux)
        //     this.setState({
        //         listDoctors: dataSelect
        //     })
        // }
    }

    handleEditorChange = ({ html, text }) => {
        this.setState({
            contentHtml: html,
            contentMarkDown: text,
        })
    }

    handleSaveContentMarkdown = () => {
        let { hasOldData } = this.state
        this.props.createInfoDoctorActions({
            contentHTML: this.state.contentHtml,
            contentMarkdown: this.state.contentMarkDown,
            description: this.state.desc,
            doctorId: this.state.selectedOption.id,
            //neu da co data thi se 'update' con chua co thi 'create'
            action: hasOldData === true ? CRUD_ACTIONS.UPDATE : CRUD_ACTIONS.CREATE,

            selectedProvince: this.state.selectedProvince.id,
            nameClinic: this.state.nameClinic,
            addressClinic: this.state.addressClinic,
            note: this.state.note,
            selectedPrice: this.state.selectedPrice.id,
            selectedPayment: this.state.selectedPayment.id,
            selectedSpecialty: this.state.selectedSpecialty && this.state.selectedSpecialty.id ? this.state.selectedSpecialty.id : '',
            selectedClinic: this.state.selectedClinic && this.state.selectedClinic.id ? this.state.selectedClinic.id : ''
        })
    }

    handleChangeSelect = async (selectedOption, name) => {
        this.setState({ selectedOption });

        let { listPrice, listPayment, listProvince, listSpecialty, listClinic } = this.state

        let res = await getDetailDoctor(selectedOption.id)
        if (res && res.errCode === 0 && res.data && res.data.Markdown) {
            let markdown = res.data.Markdown
            let { addressClinic, nameClinic, note, paymentId, priceId, provinceId, selectedPayment, selectedPrice, selectedProvince, selectedSpecialty, specialtyId, clinicId, selectedClinic } = ''
            if (res.data.Doctor_info) {
                addressClinic = res.data.Doctor_info.addressClinic
                nameClinic = res.data.Doctor_info.nameClinic
                note = res.data.Doctor_info.note
                paymentId = res.data.Doctor_info.paymentId
                priceId = res.data.Doctor_info.priceId
                provinceId = res.data.Doctor_info.provinceId
                // specialtyId = res.data.Doctor_info.Specialty.id
                specialtyId = res.data.Doctor_info.specialtyId
                clinicId = res.data.Doctor_info.clinicId

                // tra ve 1 object gom label va id
                selectedPayment = listPayment.find(item => {
                    return item && item.id === paymentId
                })
                selectedPrice = listPrice.find(item => {
                    return item && item.id === priceId
                })
                selectedProvince = listProvince.find(item => {
                    return item && item.id === provinceId
                })
                selectedSpecialty = listSpecialty.find(item => {
                    return item && item.id === +specialtyId
                })
                selectedClinic = listClinic.find(item => {
                    return item && item.id === +clinicId
                })
            } else {
                this.setState({
                    addressClinic: '',
                    nameClinic: '',
                    note: '',
                })
            }
            this.setState({
                contentHTML: markdown.contentHTML,
                contentMarkDown: markdown.contentMarkdown,
                desc: markdown.description,
                hasOldData: true,
                addressClinic: addressClinic,
                nameClinic: nameClinic,
                note: note,
                selectedPrice: selectedPrice,
                selectedPayment: selectedPayment,
                selectedProvince: selectedProvince,
                selectedSpecialty: selectedSpecialty,
                selectedClinic: selectedClinic,
            })
            console.log('>>>check state: ', this.state);
        } else {
            this.setState({
                contentHTML: '',
                contentMarkDown: '',
                desc: '',
                hasOldData: false,
                listPayment: '',
                selectedPrice: '',
                selectedPayment: '',
                selectedProvince: '',
                selectedSpecialty: '',
                selectedClinic: '',
            })
        }
        console.log(res);
    };

    handleChangeSelectContentMore = async (selectedOption, name) => {
        /**
         * stateName: selectedPrice (thuoc value={this.state.selectedPrice})
         * selectedOption {label: '200000', id: 47}
         * stateCopy[stateName] = selectedOption (gan gia tri cua selectedOption vao this.state.selectedPrice)
         */
        let stateName = name.name
        let stateCopy = { ...this.state }
        stateCopy[stateName] = selectedOption
        this.setState({
            ...stateCopy
        })
    }

    handleChangeText = (event, id) => {
        let stateCopy = { ...this.state }
        stateCopy[id] = event.target.value

        this.setState({
            ...stateCopy
        })
        console.log(stateCopy);
    }
    render() {
        let { hasOldData } = this.state
        let { selectedOption } = this.state;
        console.log('check state', this.state);
        return (
            <div className='manage-doctor-container'>
                <div className='manage-doctor-title title'><FormattedMessage id='admin.title' /></div>
                <div className='manage-doctor-content'>
                    <div className='left-content'>
                        <label><FormattedMessage id='admin.title-doctor' /></label>
                        <Select
                            value={selectedOption}
                            onChange={this.handleChangeSelect}
                            options={this.state.listDoctors}
                            placeholder={'Choose doctor'}
                        />
                    </div>
                    <div className='right-content form-group'>
                        <label><FormattedMessage id='admin.title-des' /></label>
                        <textarea className='form-control' rows='4'
                            onChange={(event) => this.handleChangeText(event, 'desc')}
                            value={this.state.desc}
                        ></textarea>
                    </div>
                </div>

                <div className='manage-doctor-content-more row'>

                    <div className='col-4 form-group'>
                        <label><FormattedMessage id='admin.title-price' /></label>
                        <Select
                            value={this.state.selectedPrice}
                            onChange={this.handleChangeSelectContentMore}
                            options={this.state.listPrice}
                            placeholder={<FormattedMessage id='admin.title-price' />}
                            name='selectedPrice'
                        />
                    </div>
                    <div className='col-4 form-group'>
                        <label><FormattedMessage id='admin.title-payment' /></label>
                        <Select
                            value={this.state.selectedPayment}
                            onChange={this.handleChangeSelectContentMore}
                            name='selectedPayment'
                            options={this.state.listPayment}
                            placeholder={<FormattedMessage id='admin.title-payment' />}
                        />
                    </div>
                    <div className='col-4 form-group'>
                        <label><FormattedMessage id='admin.title-province' /></label>
                        <Select
                            value={this.state.selectedProvince}
                            onChange={this.handleChangeSelectContentMore}
                            name='selectedProvince'
                            options={this.state.listProvince}
                            placeholder={<FormattedMessage id='admin.title-province' />}
                        />
                    </div>
                    <div className='col-4 form-group'>
                        <label><FormattedMessage id='admin.title-clinic-name' /></label>
                        <input
                            onChange={(event) => this.handleChangeText(event, 'nameClinic')}
                            value={this.state.nameClinic}
                            className='form-control' />
                    </div>
                    <div className='col-4 form-group'>
                        <label><FormattedMessage id='admin.title-clinic-address' /></label>
                        <input
                            onChange={(event) => this.handleChangeText(event, 'addressClinic')}
                            value={this.state.addressClinic}
                            className='form-control' />
                    </div>
                    <div className='col-4 form-group'>
                        <label><FormattedMessage id='admin.title-note' /></label>
                        <input
                            onChange={(event) => this.handleChangeText(event, 'note')}
                            value={this.state.note}
                            className='form-control' />
                    </div>
                    <div className='col-4 form-group'>
                        <label>Specialty</label>
                        <Select
                            value={this.state.selectedSpecialty}
                            onChange={this.handleChangeSelectContentMore}
                            options={this.state.listSpecialty}
                            placeholder={<FormattedMessage id='admin.title-price' />}
                            name='selectedSpecialty'
                        />
                    </div>

                    <div className='col-4 form-group'>
                        <label>Clinic</label>
                        <Select
                            value={this.state.selectedClinic}
                            onChange={this.handleChangeSelectContentMore}
                            options={this.state.listClinic}
                            placeholder={<FormattedMessage id='admin.title-price' />}
                            name='selectedClinic'
                        />
                    </div>

                </div>
                <div className='manage-doctor-editor'>
                    <MdEditor style={{ height: '500px' }}
                        renderHTML={text => mdParser.render(text)}
                        onChange={this.handleEditorChange}
                        value={this.state.contentMarkDown} //set default value 
                    />
                    <button className={hasOldData === true ? 'save-btn' : 'create-btn'}
                        onClick={() => this.handleSaveContentMarkdown()}
                    >
                        {hasOldData === true ?
                            <FormattedMessage id='admin.btn-save' />
                            :
                            <FormattedMessage id='admin.btn-create' />
                        }
                    </button>
                </div>

            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        listDoctorsRedux: state.admin.listDoctors,
        language: state.app.language,
        allRequiredDoctorInfo: state.admin.allRequiredDoctorInfo,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchAllDoctors: () => dispatch(actions.fetchAllDoctors()),
        createInfoDoctorActions: (data) => dispatch(actions.createInfoDoctorActions(data)),
        fetchRequiredDoctorInfo: () => dispatch(actions.fetchRequiredDoctorInfo()), // gui yeu cau lay dl tu react sang redux
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageDoctor);
